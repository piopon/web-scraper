import { ComponentType, DemoMode } from "../config/app-types.js";
import { ScrapConfig } from "../model/scrap-config.js";
import { ScrapUser } from "../model/scrap-user.js";

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { MongooseError } from "mongoose";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as RemoteStrategy } from "passport-custom";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ChallengeUtils } from "../utils/challenge-utils.js";

export class AuthConfig {
  static #EXTERNAL_PROVIDER_PASS = "external";

  #components = undefined;
  #passport = undefined;
  #config = undefined;

  /**
   * Creates a new configuration object for managing authentication settings
   * @param {Object} passport The login/register dispatcher object to be configured
   * @param {Object} components The web components used in authentication process
   * @param {Object} config The object containing initial auth configuration values
   */
  constructor(passport, components, config) {
    this.#components = components;
    this.#passport = passport;
    this.#config = config;
  }

  /**
   * Method used to configure Passport authentication object
   */
  configure() {
    // configure authenticate logic for specific endpoints
    this.#configJwtStategy();
    this.#configLoginStategy();
    this.#configRemoteStategy();
    this.#configRegisterStategy();
    // configure external auth providers
    this.#configGoogleStategy();
    // configure demo session
    this.#configDemoStategy();
    // configure common serialize and deserialize user logic
    this.#passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    this.#passport.deserializeUser(async (id, done) => {
      const user = await ScrapUser.getDatabaseModel().findById(id);
      done(null, user);
    });
    return this.#passport;
  }

  /**
   * Method used to configurate user JWT login strategy
   */
  #configJwtStategy() {
    const options = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    };
    const verify = async (jwtPayload, done) => {
      try {
        const user = await ScrapUser.getDatabaseModel().findOne({
          name: jwtPayload.name,
          email: jwtPayload.email,
        });
        if (user) {
          return done(null, user);
        }
        return done(null, false, { message: "Incorrect token." });
      } catch (error) {
        return done(null, false, { message: error.message });
      }
    };
    this.#passport.use("jwt", new JwtStrategy(options, verify));
  }

  /**
   * Method used to configurate user local login strategy
   */
  #configLoginStategy() {
    const options = { usernameField: "email", passwordField: "password" };
    const verify = async (email, password, done) => {
      try {
        // check if there is an user with provided email
        const user = await ScrapUser.getDatabaseModel().find({ email: email });
        if (user.length !== 1) {
          // did not find user with provided email - incorrect login data
          return done(null, false, { message: "Incorrect login data. Please try again." });
        }
        if (!(await bcrypt.compare(password, user[0].password))) {
          // provided password does not match the saved value - incorrect login data
          return done(null, false, { message: "Incorrect login data. Please try again." });
        }
        // login success - initialize auth components
        if (!(await this.#components.initComponents(ComponentType.AUTH, user[0]))) {
          return done(null, false, { message: "Cannot start authenticate components. Please try again." });
        }
        // updated user login date
        user[0].lastLogin = Date.now();
        await user[0].save();
        return done(null, user[0]);
      } catch (error) {
        let message = error.message;
        if (error instanceof MongooseError) {
          if (error.name === "MongooseError" && message.includes(".find()")) {
            message = "Database connection has timed out. Check connection status and please try again.";
          } else if (error.name === "ValidationError") {
            const invalidPath = Object.keys(error.errors);
            message = error.errors[invalidPath[0]].properties.message;
          }
        }
        if (message.includes("ECONNREFUSED")) {
          message = "Database connection has been broken. Check connection status and please try again.";
        }
        return done(null, false, { message: message });
      }
    };
    this.#passport.use("local-login", new LocalStrategy(options, verify));
  }

  /**
   * Method used to configurate user remote login strategy
   */
  #configRemoteStategy() {
    const verify = async (request, done) => {
      try {
        // check if there is an user with provided email
        const user = await ScrapUser.getDatabaseModel().find({
          challenge: { $regex: new RegExp("^" + request.query.challenge) },
        });
        if (user.length !== 1) {
          // did not find user with provided challenge - incorrect login data
          return done(null, false, { message: "Unknown challenge data. Please try again." });
        }
        // generate challenge phrase with current user and connectiondata
        const currentChallenge = ChallengeUtils.generate({
          name: user[0].name,
          mail: user[0].email,
          address: request.connection.remoteAddress,
        });
        if (!(await bcrypt.compare(currentChallenge, request.query.challenge))) {
          // provided challenge does not match the reference one - incorrect login data
          return done(null, false, { message: "Invalid challenge data. Please try again." });
        }
        // check challenge end-of-life date
        if (Date.now() > ChallengeUtils.parseDeadline(user[0].challenge)) {
          // provided challenge is out-of-date - incorrect login data
          return done(null, false, { message: "Outdated challenge data. Please refresh it and try again." });
        }
        // updated user login date
        user[0].lastLogin = Date.now();
        await user[0].save();
        return done(null, user[0]);
      } catch (error) {
        let message = error.message;
        if (error instanceof MongooseError) {
          if (error.name === "MongooseError" && message.includes(".find()")) {
            message = "Database connection has timed out. Check connection status and please try again.";
          } else if (error.name === "ValidationError") {
            const invalidPath = Object.keys(error.errors);
            message = error.errors[invalidPath[0]].properties.message;
          }
        }
        if (message.includes("ECONNREFUSED")) {
          message = "Database connection has been broken. Check connection status and please try again.";
        }
        return done(null, false, { message: message });
      }
    };
    this.#passport.use("remote-login", new RemoteStrategy(verify));
  }

  /**
   * Method used to configurate user local register strategy
   */
  #configRegisterStategy() {
    const options = { usernameField: "email", passwordField: "password", passReqToCallback: true };
    const verify = async (request, username, password, done) => {
      try {
        // check if there isn't an user with provided email
        const user = await ScrapUser.getDatabaseModel().find({ email: username });
        if (user.length > 0) {
          // find existing user with provided email - incorrect reguster data
          return done(null, false, { message: "Provided email is already in use. Please try again." });
        }
        // create a new user with hashed password and add it to database
        const newUser = await ScrapUser.getDatabaseModel().create({
          name: request.body.name,
          email: username,
          password: await bcrypt.hash(password, this.#config.hashSalt),
        });
        // user at this point has no config - we must create and link it
        const userConfig = await ScrapConfig.getDatabaseModel().create({ user: newUser._id });
        newUser.config = userConfig._id;
        await newUser.save();
        // return the newly created user with empty config
        return done(null, newUser);
      } catch (error) {
        let message = error.message;
        if (error instanceof MongooseError) {
          if (error.name === "MongooseError" && message.includes(".find()")) {
            message = "Database connection has timed out. Check connection status and please try again.";
          } else if (error.name === "ValidationError") {
            const invalidPath = Object.keys(error.errors);
            message = error.errors[invalidPath[0]].properties.message;
          }
        }
        if (message.includes("ECONNREFUSED")) {
          message = "Database connection has been broken. Check connection status and please try again.";
        }
        return done(null, false, { message: message });
      }
    };
    this.#passport.use("local-register", new LocalStrategy(options, verify));
  }

  /**
   * Method used to configurate login strategy via Google
   */
  #configGoogleStategy() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return;
    }
    const options = {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
    };
    const verify = async (request, accessToken, refreshToken, profile, done) => {
      const googleEmail = profile.emails[0].value;
      // verify if user authenticated via Google is already in the system
      const user = await ScrapUser.getDatabaseModel().findOne({ email: googleEmail });
      if (user) {
        return done(null, user);
      }
      // create a new user with hashed password and add it to database
      const googleUser = await ScrapUser.getDatabaseModel().create({
        name: profile.displayName,
        email: googleEmail,
        password: AuthConfig.#EXTERNAL_PROVIDER_PASS,
      });
      // user at this point has no config - we must create and link it
      const googleConfig = await ScrapConfig.getDatabaseModel().create({ user: googleUser._id });
      googleUser.config = googleConfig._id;
      await googleUser.save();
      return done(null, googleUser);
    };
    this.#passport.use("google", new GoogleStrategy(options, verify));
  }

  /**
   * Method used to configurate demo login strategy
   */
  #configDemoStategy() {
    if (!process.env.DEMO_USER || !process.env.DEMO_PASS) {
      return;
    }
    const options = { usernameField: "demo-user", passwordField: "demo-pass" };
    const verify = async (email, password, done) => {
      // since demo credentials are hardcoded in HTML then we need to verify and adjust its values
      const demoMail = email !== process.env.DEMO_USER ? process.env.DEMO_USER : email;
      const demoPass = password !== process.env.DEMO_PASS ? process.env.DEMO_PASS : password;
      try {
        // check if there is an user with provided email
        const user = await ScrapUser.getDatabaseModel().find({ email: process.env.DEMO_BASE });
        if (user.length !== 1) {
          // did not find user with provided email - incorrect login data
          return done(null, false, { message: "Demo functionality is not enabled." });
        }
        if (!(await bcrypt.compare(demoPass, user[0].password))) {
          // provided password does not match the saved value - incorrect login data
          return done(null, false, { message: "Demo functionality cannot be started." });
        }
        // login success - initialize auth components
        if (!(await this.#components.initComponents(ComponentType.AUTH, user[0]))) {
          return done(null, false, { message: "Cannot start authenticate components. Please try again." });
        }
        // create demo session duplicate if needed
        if (!DemoMode.OVERWRITE.equals(this.#config.demoMode)) {
          // create a clone of the base demo user with updated email and last login entry
          user[0].hostUser = user[0]._id;
          user[0]._id = new mongoose.Types.ObjectId();
          user[0].email = await this.#generateDemoEmail(demoMail);
          user[0].lastLogin = Date.now();
          user[0].isNew = true;
          // create a clone of base demo user configuration
          const config = await ScrapConfig.getDatabaseModel().findOne({ user: user[0].hostUser });
          config._id = new mongoose.Types.ObjectId();
          config.user = user[0]._id;
          config.isNew = true;
          await config.save();
          // link config clone to cloned demo user and save demo user
          user[0].config = config._id;
          await user[0].save();
        }
        return done(null, user[0]);
      } catch (error) {
        let message = error.message;
        if (error instanceof MongooseError) {
          if (error.name === "MongooseError" && message.includes(".find()")) {
            message = "Database connection has timed out. Check connection status and please try again.";
          } else if (error.name === "ValidationError") {
            const invalidPath = Object.keys(error.errors);
            message = error.errors[invalidPath[0]].properties.message;
          }
        }
        if (message.includes("ECONNREFUSED")) {
          message = "Database connection has been broken. Check connection status and please try again.";
        }
        return done(null, false, { message: message });
      }
    };
    this.#passport.use("local-demo", new LocalStrategy(options, verify));
  }

  /**
   * Method used to generate random demo user email to avoid DB key duplicates
   * @param {String} commonEmail The base version of the email to be randomized
   * @returns randomized email for the demo user
   */
  async #generateDemoEmail(commonEmail) {
    const demoAccounts = await ScrapUser.getDatabaseModel().find({ hostUser: { $ne: null } });
    const decomposedEmail = commonEmail.split("@");
    const randomDemoUser =
      decomposedEmail[0] + demoAccounts.length + "#" + (Math.random() + 1).toString(36).substring(7);
    return randomDemoUser + "@" + decomposedEmail[1];
  }
}

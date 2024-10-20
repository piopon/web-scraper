import { ScrapConfig } from "../model/scrap-config.js";
import { ScrapUser } from "../model/scrap-user.js";

import bcrypt from "bcrypt";
import { MongooseError } from "mongoose";
import { Strategy as LocalStategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

export class AuthConfig {
  static #ENCRYPT_SALT = 10;

  #passport = undefined;

  constructor(passport) {
    this.#passport = passport;
  }

  /**
   * Method used to configure Passport authentication object
   */
  configure() {
    // configure authenticate logic for specific endpoints
    this.#configJwtStategy();
    this.#configRegisterStategy();
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
   * @param {Object} passport The login auth and stategy object
   */
  #configJwtStategy() {
    const options = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    };
    const verify = async (jwtPayload, done) => {
      try {
        const user = await ScrapUser.getDatabaseModel().findById(jwtPayload._id);
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
   * Method used to configurate user local register strategy
   * @param {Object} passport The register auth and stategy object
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
          password: await bcrypt.hash(password, AuthConfig.#ENCRYPT_SALT),
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
    this.#passport.use("local-register", new LocalStategy(options, verify));
  }
}

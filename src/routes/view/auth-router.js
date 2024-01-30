import { ScrapConfig } from "../../model/scrap-config.js";
import { ScrapUser } from "../../model/scrap-user.js";

import bcrypt from "bcrypt";
import { MongooseError } from "mongoose";
import { Strategy } from "passport-local";

export class AuthRouter {
  static #ENCRYPT_SALT = 10;

  #components = [];
  #passport = undefined;

  /**
   * Creates a new auth router for managing user authentication and authorization
   * @param {Array} components The components list used in auth process (LOGIN)
   * @param {Object} passport The object controlling user sing-up and sing-in process
   */
  constructor(components, passport) {
    this.#components = components;
    this.#passport = passport;
    this.#configAuthenitcation(passport);
  }

  /**
   * Method used to configure Passport authentication object
   * @param {Object} passport The auth object to be configured
   */
  #configAuthenitcation(passport) {
    // configure authenticate logic for specific endpoints
    this.#configRegisterStategy(passport);
    // configure common serialize and deserialize user logic
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    passport.deserializeUser(async (id, done) => {
      const user = await ScrapUser.getDatabaseModel().findById(id);
      done(null, user);
    });
  }

  /**
   * Method used to configurate user register strategy
   * @param {Object} passport The login auth and stategy object
   */
  #configRegisterStategy(passport) {
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
          password: await bcrypt.hash(password, AuthRouter.#ENCRYPT_SALT),
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
    passport.use("local-register", new Strategy(options, verify));
  }

  /**
   * Method used to initialize and start view-related components
   * @param {Object} user The authenticated user object for which we want to start components
   * @returns true if all components are invoked, false if at least one has an error
   */
  async #runComponents(user) {
    for (const component of this.#components) {
      // if component is not required to pass then we start it and go to the next one
      if (!component.getInfo().mustPass) {
        component.start(user);
        continue;
      }
      // component must pass so we are waiting for the result to check it
      if (!(await component.start(user))) {
        return false;
      }
    }
    return true;
  }
}
import { AccessChecker } from "../../middleware/access-checker.js";
import { ScrapConfig } from "../../model/scrap-config.js";
import { ScrapUser } from "../../model/scrap-user.js";

import express from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import { MongooseError } from "mongoose";
import { Strategy } from "passport-local";

export class ViewRouter {
  static #ENCRYPT_SALT = 10;

  #configFilePath = undefined;
  #passport = undefined;

  /**
   * Creates a new view router for displaying configuraion file for the user
   * @param {String} configFile The path to the configuration file
   */
  constructor(configFile, passport) {
    this.#configFilePath = configFile;
    this.#passport = passport;
    this.#configAuthenitcation(passport);
  }

  /**
   * Method used to create routes for view endpoints
   * @returns router object for handling view requests
   */
  createRoutes() {
    const router = express.Router();
    this.#createGetRoutes(router);
    this.#createPostRoutes(router);

    return router;
  }

  /**
   * Method used to create GET method routes and add them to the router object
   * @param {Object} router The router object with GET method routes defined
   */
  #createGetRoutes(router) {
    router.get("/", AccessChecker.canViewContent, async (request, response) => {
      const scrapConfig = await this.#getScrapConfigForUser(request.user);
      response.render("index", {
        title: "scraper configuration",
        user: request.user.name,
        content: scrapConfig.toJSON(),
        categories: this.#getSupportedCategories(),
        currencies: this.#getSupportedCurrencies(),
      });
    });
    router.get("/status", AccessChecker.canViewContent, (request, response) =>
      response.render("status", {
        title: "scraper running status",
        user: request.user.name,
      })
    );
    router.get("/register", AccessChecker.canViewSessionUser, (request, response) =>
      response.render("register", { title: "scraper user registration" })
    );
    router.get("/login", AccessChecker.canViewSessionUser, (request, response) =>
      response.render("login", { title: "scraper user login" })
    );
  }

  /**
   * Method used to create POST method routes and add them to the router object
   * @param {Object} router The router object with POST method routes defined
   */
  #createPostRoutes(router) {
    // user sessions endpoints (sign-in and log-in)
    const registerCallback = this.#passport.authenticate("local-register", {
      successRedirect: "/login",
      failureRedirect: "/register",
      failureFlash: true,
      session: false,
    });
    router.post("/register", AccessChecker.canViewSessionUser, registerCallback);
    const loginCallback = this.#passport.authenticate("local-login", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    });
    router.post("/login", AccessChecker.canViewSessionUser, loginCallback);
    // user content endpoints (log-out)
    const logoutCallback = (request, response, next) => {
      request.logout((err) => {
        if (err) return next(err);
        response.redirect("/login");
      });
    };
    router.post("/logout", AccessChecker.canViewContent, logoutCallback);
  }

  /**
   * Method used to receive all categories supported by web scraper
   * @returns a String with supported categories separated by '|' character
   */
  #getSupportedCategories() {
    return "📈|💰|👕|👗|👢|🍔|🛒|👪|🐶|🐱|🏠|🚘|⛽|💊|📚|⛺|🧸|⚽|🔨|💻|📀|📱|🎮|🎵|🎥|🧩|🎴|💎|💄|🔥";
  }

  /**
   * Method used to receive all currencies supported by web scraper
   * @returns a String with supported currencies separated by '|' character
   */
  #getSupportedCurrencies() {
    return "PLN|GBP|USD|EUR|CHF|CZK|DKK|CNY|JPY|INR|AUD|CAD";
  }

  /**
   * Method used to retrieve scraper configuration for specified user
   * @param {Object} user The ID of the user which configuration we want to retrieve
   * @returns The scraper configuration of the specified user
   */
  async #getScrapConfigForUser(user) {
    if (user.config == null) {
      // user has no config - create and link it
      const scrapConfig = await ScrapConfig.getDatabaseModel().create({ user: user._id });
      user.config = scrapConfig._id;
      await user.save();
      return scrapConfig;
    }
    // user has config - find and return it
    return await ScrapConfig.getDatabaseModel().findById(user.config);
  }

  /**
   * Method used to configure Passport authentication object
   * @param {Object} passport The auth object to be configured
   */
  #configAuthenitcation(passport) {
    // configure authenticate logic for specific endpoints
    this.#configLoginStategy(passport);
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
   * Method used to configurate user login strategy (currently only local login is possible)
   * @param {Object} passport The login auth and stategy object
   */
  #configLoginStategy(passport) {
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
    passport.use("local-login", new Strategy(options, verify));
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
        // create new user with hashed password, add it to database and proceed with passport logic
        return done(
          null,
          await ScrapUser.getDatabaseModel().create({
            name: request.body.name,
            email: username,
            password: await bcrypt.hash(password, ViewRouter.#ENCRYPT_SALT),
          })
        );
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
}

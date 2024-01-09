import { AccessChecker } from "../../middleware/access-checker.js";
import { ScrapConfig } from "../../model/scrap-config.js";

import express from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import { Strategy } from "passport-local";

export class ViewRouter {
  #configFilePath = undefined;
  #passport = undefined;
  #users = [];

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
    router.get("/", AccessChecker.canViewContent, (request, response) => {
      const scrapConfig = JSON.parse(fs.readFileSync(this.#configFilePath)).map((item) => new ScrapConfig(item));
      response.render("index", {
        title: "scraper configuration",
        user: request.user.name,
        content: scrapConfig,
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
    const signStrategy = "local-register";
    const signConfig = { successRedirect: "/login", failureRedirect: "/register", failureFlash: true, session: false };
    router.post("/register", AccessChecker.canViewSessionUser, this.#passport.authenticate(signStrategy, signConfig));
    const loginStrategy = "local-login";
    const loginConfig = { successRedirect: "/", failureRedirect: "/login", failureFlash: true };
    router.post("/login", AccessChecker.canViewSessionUser, this.#passport.authenticate(loginStrategy, loginConfig));
    router.post("/logout", AccessChecker.canViewContent, (request, response, next) => {
      request.logout((err) => {
        if (err) {
          return next(err);
        }
        response.redirect("/login");
      });
    });
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

  #configAuthenitcation(passport) {
    // configure authenticate logic for specific endpoints
    this.#configLoginStategy(passport);
    this.#configRegisterStategy(passport);
    // configure common serialize and deserialize user logic
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => done(null, this.#users.find(user => user.id === id)));
  }

  /**
   * Method used to configurate user login strategy (currently only local login is possible)
   * @param {Object} passport The login auth and stategy object
   */
  #configLoginStategy(passport) {
    const authenticateUser = async (email, password, done) => {
      // check if there is an user with provided email
      const user = this.#users.find((user) => user.email === email);
      if (user == null) {
        // did not find user with provided email - incorrect login data
        return done(null, false, { message: "Incorrect login data" });
      }
      try {
        if (!(await bcrypt.compare(password, user.password))) {
          // provided password does not match the saved value - incorrect login data
          return done(null, false, { message: "Incorrect login data" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    };
    passport.use("local-login", new Strategy({ usernameField: "email", passwordField: "password" }, authenticateUser));
  }

  #configRegisterStategy(passport) {
    const options = { usernameField: "email", passwordField: "password", passReqToCallback: true };
    const verify = async (request, username, password, done) => {
      try {
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = {
          id: Date.now().toString(),
          name: request.body.name,
          email: username,
          password: hashPassword,
        };
        this.#users.push(newUser);
        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    };
    passport.use("local-register", new Strategy(options, verify));
  }
}

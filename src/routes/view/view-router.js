import { ScrapConfig } from "../../model/scrap-config.js";

import express from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import { Strategy } from 'passport-local';

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
    this.#configLoginStategy(passport);
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
    router.get("/", (request, response) => {
      const scrapConfig = JSON.parse(fs.readFileSync(this.#configFilePath)).map((item) => new ScrapConfig(item));
      response.render("index", {
        title: "scraper configuration",
        content: scrapConfig,
        categories: this.#getSupportedCategories(),
        currencies: this.#getSupportedCurrencies(),
      });
    });
    router.get("/status", (request, response) => response.render("status", { title: "scraper running status" }));
    router.get("/register", (request, response) => response.render("register", { title: "scraper user registration" }));
    router.get("/login", (request, response) => response.render("login", { title: "scraper user login" }));
  }

  /**
   * Method used to create POST method routes and add them to the router object
   * @param {Object} router The router object with POST method routes defined
   */
  #createPostRoutes(router) {
    router.post("/register", async (request, response) => {
      try {
        const hashPassword = await bcrypt.hash(request.body.password, 10);
        this.#users.push({
          id: Date.now().toString(),
          email: request.body.email,
          password: hashPassword
        });
        response.redirect("/login");
      } catch (error) {
        response.redirect("/register");
      }
    });
    const loginStrategy = "local";
    const loginConfig = { successRedirect: "/", failureRedirect: "/login", failureFlash: true };
    router.post("/login", this.#passport.authenticate(loginStrategy, loginConfig));
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

  #configLoginStategy(passport) {
    const authenticateUser = (email, password, done) => {
      console.log(`Authenticating user: ${email}`);
    };
    passport.use(new Strategy( {usernameField: "email", passwordField: "password"}, authenticateUser));
  }
}

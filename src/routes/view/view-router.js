import { ScrapConfig } from "../../model/scrap-config.js";

import express from "express";
import fs from "fs";

export class ViewRouter {
  #configFilePath = undefined;

  /**
   * Creates a new view router for displaying configuraion file for the user
   * @param {String} configFile The path to the configuration file
   */
  constructor(configFile) {
    this.#configFilePath = configFile;
  }

  /**
   * Method used to create routes for view endpoints
   * @returns router object for handling view requests
   */
  createRoutes() {
    const router = express.Router();
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
    router.get("/login", (request, response) => response.render("login", { title: "scraper user login" }));
    return router;
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
}

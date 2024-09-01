import { LogLevel } from "../../../config/app-types.js";
import { AccessChecker } from "../../middleware/access-checker.js";
import { ScrapConfig } from "../../model/scrap-config.js";

import express from "express";
import moment from "moment";

export class ViewRouter {
  #dataFilePath = undefined;

  constructor(dataFile) {
    this.#dataFilePath = dataFile;
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
      const scrapConfig = await ScrapConfig.getDatabaseModel().findById(request.user.config);
      response.render("index", {
        title: "scraper configuration",
        type: "home",
        user: request.user.name,
        content: scrapConfig.toJSON(),
        categories: this.#getSupportedCategories(),
        currencies: this.#getSupportedCurrencies(),
      });
    });
    router.get("/status", AccessChecker.canViewContent, (request, response) =>
      response.render("status", {
        title: "scraper running status",
        type: "status",
        user: request.user.name,
        date: moment().format("YYYY-MM-DD"),
        components: this.#getSupportedComponents(),
        statusTypes: this.#getSupportedStatusTypes(),
      })
    );
  }

  /**
   * Method used to create POST method routes and add them to the router object
   * @param {Object} router The router object with POST method routes defined
   */
  #createPostRoutes(router) {
    router.post("/image", AccessChecker.canViewContent, async (request, response) => {
      const inputImage = request.files.auxiliary;
      if (!inputImage) {
        return response.status(400).json({message: "No image provided"});
      }
      console.log(inputImage);
      response.sendStatus(200);
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

  /**
   * Method used to receive all components supported by web scraper
   * @returns a String with supported components separated by '|' character
   */
  #getSupportedComponents() {
    return "all|web-components|web-database|web-scraper|web-server";
  }

  /**
   * Method used to receive all log levels supported by web scraper
   * @returns a String with supported log levels separated by '|' character
   */
  #getSupportedStatusTypes() {
    const allLogLevels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARNING, LogLevel.ERROR];
    return `all|${allLogLevels.map((level) => level.description).join("|")}`;
  }
}

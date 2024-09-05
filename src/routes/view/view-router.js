import { LogLevel } from "../../../config/app-types.js";
import { AccessChecker } from "../../middleware/access-checker.js";
import { ScrapConfig } from "../../model/scrap-config.js";

import express from "express";
import moment from "moment";
import path from "path";
import fs from "fs";

export class ViewRouter {
  #dataFilePath = undefined;

  /**
   * Creates a new view router for displaying scraper config settings
   * @param {String} dataFile The path to the data file
   */
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
      const inputFile = request.files;
      if (!inputFile) {
        return response.status(400).json({message: "No file provided"});
      }
      // file data information is stored in object which name is equal to HTML file input name attribute
      const fileObject = inputFile.auxiliary;
      // verify if input file is an image (has appropriate MIME type)
      const imageMimeRegex = /^image/;
      if (!imageMimeRegex.test(fileObject.mimetype)) {
        return response.status(400).json({message: "Not an image file"});
      }
      const newImagePath = path.join(this.#dataFilePath, request.user.email, "images", fileObject.name)
      const newImageRoot = path.dirname(newImagePath);
      if (!fs.existsSync(newImageRoot)) {
        fs.mkdirSync(newImageRoot, { recursive: true });
      }
      fileObject.mv(newImagePath);
      response.status(200).json({message: "Image uploaded"});
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

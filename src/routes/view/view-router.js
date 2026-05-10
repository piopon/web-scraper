import { LogLevel } from "../../config/app-types.js";
import { AccessChecker } from "../../middleware/access-checker.js";
import { ScrapConfig } from "../../model/scrap-config.js";

import express from "express";
import moment from "moment";
import path from "path";
import fs from "fs";

export class ViewRouter {
  #uploadPath = undefined;
  #extrasType = undefined;

  /**
   * Creates a new view router for displaying scraper config settings
   * @param {Object} config The application config with needed settings
   */
  constructor(config) {
    this.#uploadPath = config.usersDataConfig.upload;
    this.#extrasType = config.scraperConfig.dataExtrasType;
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
        monitor: this.#getMonitorAddress(),
        content: scrapConfig.toJSON(),
        categories: this.#getSupportedCategories(),
        extras: new Map([["CURRENCIES", this.#getSupportedCurrencies()]]).get(this.#extrasType),
      });
    });
    router.get("/status", AccessChecker.canViewContent, (request, response) =>
      response.render("status", {
        title: "scraper running status",
        type: "status",
        user: request.user.name,
        monitor: this.#getMonitorAddress(),
        date: moment().format("YYYY-MM-DD"),
        components: this.#getSupportedComponents(),
        statusTypes: this.#getSupportedStatusTypes(),
      })
    );
    router.get("/settings", AccessChecker.canViewContent, (request, response) =>
      response.render("settings", {
        title: "scraper settings",
        type: "settings",
        user: request.user.name,
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
        return response.status(400).json("No file provided");
      }
      // file data information is stored in object which name is equal to HTML file input name attribute
      const fileObject = inputFile["auxiliary-file"];
      // verify if input file is an image (has appropriate MIME type)
      const imageMimeRegex = /^image/;
      if (!imageMimeRegex.test(fileObject.mimetype)) {
        return response.status(400).json("Provided file is NOT an image file");
      }
      const userSegment = request.user?.email;
      const invalidUserSegment =
        !userSegment ||
        typeof userSegment !== "string" ||
        /[\\/]/.test(userSegment) ||
        [".", ".."].includes(userSegment) ||
        path.normalize(userSegment) !== userSegment;
      if (invalidUserSegment) {
        return response.status(400).json("Invalid user identifier provided");
      }
      const originalName = fileObject.name;
      const safeName = path.basename(originalName);
      const hasPathSeparators = /[\\/]/.test(originalName);
      const invalidName = hasPathSeparators || !safeName || [".", ".."].includes(safeName);
      if (invalidName) {
        return response.status(400).json("Invalid file name provided");
      }
      const newImagePath = path.join(this.#uploadPath, userSegment, safeName);
      const newImageRoot = path.dirname(newImagePath);
      if (!fs.existsSync(newImageRoot)) {
        fs.mkdirSync(newImageRoot, { recursive: true });
      }
      try {
        await fileObject.mv(newImagePath);
      } catch (_error) {
        return response.status(500).json("Could not upload image file");
      }
      response.status(200).json({
        url: `${this.#getServerAddress()}/${userSegment}/${safeName}`,
        message: `Successfully uploaded image: ${safeName}`,
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

  /**
   * Method used to retrieve scraper server URL address (URI + optional port)
   * @returns string containing scraper address
   */
  #getServerAddress() {
    if (!process.env.SERVER_ADDRESS) {
      return `http://localhost:${process.env.SERVER_PORT}`;
    } else if (process.env.SERVER_ADDRESS.includes("localhost")) {
      return `${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`;
    } else {
      return process.env.SERVER_ADDRESS;
    }
  }

  /**
   * Method used to retrieve data monitor URL address (URI + optional port)
   * @returns string containing data monitor address or undefined (if no address provided)
   */
  #getMonitorAddress() {
    if (!process.env.MONITOR_ADDRESS) {
      return undefined;
    }
    const portString = process.env.MONITOR_PORT ? `:${process.env.MONITOR_PORT}` : ``;
    return `${process.env.MONITOR_ADDRESS}${portString}`;
  }
}

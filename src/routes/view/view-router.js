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
      response.render("index", { title: "scraper configuration", content: scrapConfig })
    });
    router.get("/status", (request, response) => response.render("status", { title: "scraper running status" }));
    return router;
  }
}

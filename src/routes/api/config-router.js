import express from "express";
import fs from "fs";

export class ConfigRouter {
  #configFilePath = undefined;

  /**
   * Creates a new config router for configuring appropriate endpoints
   * @param {String} configFile The path to the configuration file
   */
  constructor(configFile) {
    this.#configFilePath = configFile;
  }

  /**
   * Method used to create routes for scraping ocnfiguration values
   * @returns router object for handling config requests
   */
  createRoutes() {
    const router = express.Router();
    router.get("/", (request, response) => {
      var configContent = JSON.parse(fs.readFileSync(this.#configFilePath));
      var filteredData = configContent.filter((data) => {
        return request.query.user ? data.user === parseInt(request.query.user) : true;
      });
      response.status(200).json(filteredData);
    });
    return router;
  }
}

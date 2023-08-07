import Ajv from "ajv";
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
      const validationResult = this.#validateQueryParams(request.url, request.query);
      if (!validationResult.valid) {
        response.status(400).json(validationResult.cause);
        return;
      }
      var configContent = JSON.parse(fs.readFileSync(this.#configFilePath));
      var filteredData = configContent.filter((data) => {
        return request.query.user ? data.user === parseInt(request.query.user) : true;
      });
      response.status(200).json(filteredData);
    });
    return router;
  }

  /**
   * Method used to validate the config router endpoint query parameters
   * @param {String} url The endpoint URL address
   * @param {Object} params The query parameters which should be validated
   * @returns an object with validation result (true/false) and an optional cause (if validation NOK)
   */
  #validateQueryParams(url, params) {
    const validator = new Ajv();
    const validate = validator.compile({
      type: "object",
      additionalProperties: false,
      properties: { user: { type: "string" } },
    });
    return { valid: validate(params), cause: validate.errors };
  }
}

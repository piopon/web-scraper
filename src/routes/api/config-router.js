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
        return request.query.user ? data.user === request.query.user : true;
      });
      response.status(200).json(filteredData);
    });
    router.get("/groups", (request, response) => {
      const validationResult = this.#validateQueryParams(request.url, request.query);
      if (!validationResult.valid) {
        response.status(400).json(validationResult.cause);
        return;
      }
      var configContent = JSON.parse(fs.readFileSync(this.#configFilePath));
      var groupsContent = configContent.flatMap((item) => item.groups);
      var filteredData = groupsContent.filter((data) => {
        const nameOk = request.query.name ? data.name === request.query.name : true;
        const categoryOk = request.query.category ? data.category === request.query.category : true;
        const domainOk = request.query.domain ? data.domain === request.query.domain : true;
        return nameOk && categoryOk && domainOk;
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
      properties: this.#getAcceptedQueryParams(url),
    });
    return { valid: validate(params), cause: validate.errors };
  }

  /**
   * Method used to get accepter query params object for specified URL address
   * @param {String} url The endpoint URL address for which we want to get accepted query params definition
   * @returns an object definition with accepted query params
   */
  #getAcceptedQueryParams(url) {
    const pathParams = new Map([
      ["/", { user: { type: "integer", minimum: 0 } }],
      ["/groups", { name: { type: "string" }, category: { type: "string" }, domain: { type: "string" } }],
    ]);
    return pathParams.get(url.substring(0, url.indexOf("?")));
  }
}

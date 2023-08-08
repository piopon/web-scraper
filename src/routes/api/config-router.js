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
    this.#createGetRoutes(router);

    return router;
  }

  /**
   * Method used to create GET method routes and add them to the router object
   * @param {Object} router The router object with GET method routes defined
   */
  #createGetRoutes(router) {
    router.get("/", (request, response) => {
      this.#handleGetRequest(request, response, (configContent) =>
        configContent.filter((item) => (request.query.user ? item.user === request.query.user : true))
      );
    });
    router.get("/groups", (request, response) => {
      this.#handleGetRequest(request, response, (configContent) =>
        configContent
          .flatMap((item) => item.groups)
          .filter((item) => {
            const nameOk = request.query.name ? item.name === request.query.name : true;
            const categoryOk = request.query.category ? item.category === request.query.category : true;
            const domainOk = request.query.domain ? item.domain === request.query.domain : true;
            return nameOk && categoryOk && domainOk;
          })
      );
    });
  }

  /**
   * Method containing common logic used to handle GET requests
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} filter The function using query and path params to return appropriate data
   */
  #handleGetRequest(request, response, filter) {
    const validationResult = this.#validateQueryParams(request.url, request.query);
    if (!validationResult.valid) {
      response.status(400).json(validationResult.cause);
      return;
    }
    const configContent = JSON.parse(fs.readFileSync(this.#configFilePath));
    const filteredData = filter(configContent);
    response.status(200).json(filteredData);
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

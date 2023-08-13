import { ScrapComponent } from "../../model/scrap-component.js";
import { ScrapConfig } from "../../model/scrap-config.js";
import { ScrapValidator } from "../../model/scrap-validator.js";
import { ScrapWarning } from "../../model/scrap-exception.js";

import Ajv from "ajv";
import express from "express";
import path from "path";
import fs from "fs";
import { ScrapGroup } from "../../model/scrap-group.js";
import { ScrapObserver } from "../../model/scrap-observer.js";

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
    this.#createPostRoutes(router);

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
    router.get("/groups/observers", (request, response) => {
      this.#handleGetRequest(request, response, (configContent) =>
        configContent
          .flatMap((item) => item.groups)
          .flatMap((item) => item.observers)
          .filter((item) => {
            const pathOk = request.query.path ? item.path === request.query.path : true;
            const targetOk = request.query.target ? item.target === request.query.target : true;
            const historyOk = request.query.history ? item.history === request.query.history : true;
            return pathOk && targetOk && historyOk;
          })
      );
    });
    router.get("/groups/observers/components", (request, response) => {
      this.#handleGetRequest(request, response, (configContent) =>
        configContent
          .flatMap((item) => item.groups)
          .flatMap((item) => item.observers)
          .map((item) => item[request.query.source])
          .filter((item) => {
            const intervalOk = request.query.interval ? item.interval === request.query.interval : true;
            const attributeOk = request.query.attribute ? item.attribute === request.query.attribute : true;
            const auxiliaryOk = request.query.auxiliary ? item.auxiliary === request.query.auxiliary : true;
            return intervalOk && attributeOk && auxiliaryOk;
          })
      );
    });
  }

  /**
   * Method used to create POST method routes and add them to the router object
   * @param {Object} router The router object with POST method routes defined
   */
  #createPostRoutes(router) {
    router.post("/", (request, response) => {
      const requestBodyObject = request.body;
      // validate request body content by schema structure
      const validate = new Ajv().compile(ScrapConfig.getSchema());
      if (!validate(requestBodyObject)) {
        response.status(400).json(validate.errors);
        return;
      }
      // validate request body content by values
      const scrapConfigCandidate = new ScrapConfig(requestBodyObject);
      try {
        var scrapConfig = new ScrapValidator(scrapConfigCandidate).validate();
      } catch (e) {
        if (e instanceof ScrapWarning) {
          scrapConfig = scrapConfigCandidate;
        } else {
          response.status(400).json(e.message);
          return;
        }
      }
      // add new schema to file
      const configContent = JSON.parse(fs.readFileSync(this.#configFilePath));
      configContent.push(scrapConfig);
      const configDirectory = path.dirname(this.#configFilePath);
      if (!fs.existsSync(configDirectory)) {
        fs.mkdirSync(configDirectory, { recursive: true });
      }
      fs.writeFileSync(this.#configFilePath, JSON.stringify(configContent, null, 2));
      response.status(200).send("Added new scrap configuration");
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
      ["/", ScrapConfig.getQueryParams()],
      ["/groups", ScrapGroup.getQueryParams()],
      ["/groups/observers", ScrapObserver.getQueryParams()],
      ["/groups/observers/components", ScrapComponent.getQueryParams()],
    ]);
    return pathParams.get(url.substring(0, url.indexOf("?")));
  }
}

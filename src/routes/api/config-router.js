import { ScrapComponent } from "../../model/scrap-component.js";
import { ScrapConfig } from "../../model/scrap-config.js";
import { ScrapGroup } from "../../model/scrap-group.js";
import { ScrapObserver } from "../../model/scrap-observer.js";
import { ScrapValidator } from "../../model/scrap-validator.js";
import { ScrapWarning } from "../../model/scrap-exception.js";

import Ajv from "ajv";
import express from "express";
import path from "path";
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
      this.#handlePostRequest(request, response, (configContent) => configContent);
    });
  }

  /**
   * Method containing common logic used to handle GET requests
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} filter The function using query and path params to return appropriate data
   */
  #handleGetRequest(request, response, filter) {
    const validationResult = this.#validateQueryParams(request.method, request.url, request.query);
    if (!validationResult.valid) {
      response.status(400).json(validationResult.cause);
      return;
    }
    const configContent = JSON.parse(fs.readFileSync(this.#configFilePath));
    const filteredData = filter(configContent);
    response.status(200).json(filteredData);
  }

  /**
   * Method containing common logic used to handle POST requests
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} parent The function used to get the parent of the body content
   */
  #handlePostRequest(request, response, parent) {
    const paramsValidation = this.#validateQueryParams(request.method, request.url, request.query);
    if (!paramsValidation.valid) {
      response.status(400).json(paramsValidation.cause);
      return;
    }
    const bodyValidation = this.#validateBody(request.body);
    if (!bodyValidation.content) {
      response.status(400).json(bodyValidation.cause);
      return;
    }
    const addResult = this.#updateConfig((initalConfig) => {
      const contentParent = parent(initalConfig);
      if (!contentParent) {
        return { success: false, message: "Undefined parent" };
      }
      contentParent.push(bodyValidation.content);
      return { success: true, message: "Added new configuration" };
    });
    response.status(addResult.status).send(addResult.message);
  }

  /**
   * Method used to validate the config router endpoint query parameters
   * @param {String} method The endpoint method for which we want to check parameters
   * @param {String} url The endpoint URL address (containing only the path)
   * @param {Object} params The query parameters which should be validated
   * @returns an object with validation result (true/false) and an optional cause (if validation NOK)
   */
  #validateQueryParams(method, url, params) {
    const paramsStartIndex = url.indexOf("?");
    if (paramsStartIndex < 0) {
      return { valid: true, cause: undefined };
    }
    const pathParams = new Map([
      ["/", ScrapConfig.getQueryParams(method)],
      ["/groups", ScrapGroup.getQueryParams(method)],
      ["/groups/observers", ScrapObserver.getQueryParams(method)],
      ["/groups/observers/components", ScrapComponent.getQueryParams(method)],
    ]);
    const paramsSchema = pathParams.get(url.substring(0, paramsStartIndex));
    const validate = new Ajv().compile(paramsSchema);
    return { valid: validate(params), cause: validate.errors };
  }

  /**
   * Method used to validate request body for correct config object
   * @param {Object} requestBody The object which shoulde be validated
   * @returns the parsed and validated config if ok, error cause otherwise
   */
  #validateBody(requestBody) {
    let parsedBody = undefined;
    // validate JSON structure of the request body content
    const validate = new Ajv().compile(ScrapConfig.getSchema());
    if (!validate(requestBody)) {
      return { content: parsedBody, cause: validate.errors };
    }
    // validate JSON values of the request body content
    const bodyCandidate = new ScrapConfig(requestBody);
    try {
      parsedBody = new ScrapValidator(bodyCandidate).validate();
    } catch (error) {
      if (error instanceof ScrapWarning) {
        parsedBody = bodyCandidate;
      } else {
        return { content: parsedBody, cause: error.message };
      }
    }
    return { content: parsedBody, cause: undefined };
  }

  /**
   * Method used to update the configuration file with the provided logic
   * @param {Function} update The update logic to apply when altering config file (add, edit, or delete)
   */
  #updateConfig(update) {
    const configDirectory = path.dirname(this.#configFilePath);
    if (!fs.existsSync(configDirectory)) {
      fs.mkdirSync(configDirectory, { recursive: true });
    }
    const configContent = JSON.parse(fs.readFileSync(this.#configFilePath));
    const updateStatus = update(configContent);
    if (updateStatus.success) {
      fs.writeFileSync(this.#configFilePath, JSON.stringify(configContent, null, 2));
    }
    return { status: updateStatus.success ? 200 : 400, message: updateStatus.message };
  }
}

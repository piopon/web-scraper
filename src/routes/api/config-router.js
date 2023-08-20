import { ScrapComponent } from "../../model/scrap-component.js";
import { ScrapConfig } from "../../model/scrap-config.js";
import { ScrapGroup } from "../../model/scrap-group.js";
import { ScrapObserver } from "../../model/scrap-observer.js";

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
    this.#createPutRoutes(router);
    this.#createPostRoutes(router);
    this.#createDeleteRoutes(router);

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
   * Method used to create PUT method routes and add them to the router object
   * @param {Object} router The router object with PUT method routes defined
   */
  #createPutRoutes(router) {
    router.put("/", (request, response) => {
      this.#handlePutRequest(
        request,
        response,
        (configContent) => configContent,
        (parent) => {
          return parent.findIndex((item) => (request.query.user ? item.user === request.query.user : false));
        }
      );
    });
    router.put("/groups", (request, response) => {
      this.#handlePutRequest(
        request,
        response,
        (configContent) => configContent.flatMap((item) => item.groups),
        (parent) => {
          return parent.findIndex((item) => (request.query.domain ? item.domain === request.query.domain : false));
        }
      );
    });
    router.put("/groups/observers", (request, response) => {
      this.#handlePutRequest(
        request,
        response,
        (configContent) => configContent.flatMap((item) => item.groups).flatMap((item) => item.observers),
        (parent) => {
          return parent.findIndex((item) => (request.query.path ? item.path === request.query.path : false));
        }
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
    router.post("/groups", (request, response) => {
      this.#handlePostRequest(request, response, (configContent) => {
        const parentConfig = configContent.filter((config) => config.user === request.query.parent);
        return parentConfig.length > 0 ? parentConfig.at(0).groups : undefined;
      });
    });
    router.post("/groups/observers", (request, response) => {
      this.#handlePostRequest(request, response, (configContent) => {
        const parentGroup = configContent
          .flatMap((config) => config.groups)
          .filter((group) => group.domain === request.query.parent);
        return parentGroup.length > 0 ? parentGroup.at(0).observers : undefined;
      });
    });
  }

  /**
   * Method used to create DELETE method routes and add them to the router object
   * @param {Object} router The router object with DELETE method routes defined
   */
  #createDeleteRoutes(router) {
    router.delete("/", (request, response) => {
      this.#handleDeleteRequest(request, response, (configContent) => {
        for (let configIndex = 0; configIndex < configContent.length; configIndex++) {
          if (configContent[configIndex].user === request.query.user) {
            return { found: { parent: configContent, index: configIndex }, reason: undefined };
          }
        }
        return { found: undefined, reason: "Could not find item to delete" };
      });
    });
    router.delete("/groups", (request, response) => {
      this.#handleDeleteRequest(request, response, (configContent) => {
        for (let configIndex = 0; configIndex < configContent.length; configIndex++) {
          const currentConfig = configContent[configIndex];
          for (let groupIndex = 0; groupIndex < currentConfig.groups.length; groupIndex++) {
            if (currentConfig.groups[groupIndex].domain === request.query.domain) {
              return { found: { parent: currentConfig.groups, index: groupIndex }, reason: undefined };
            }
          }
        }
        return { found: undefined, reason: "could not find item to delete" };
      });
    });
    router.delete("/groups/observers", (request, response) => {
      this.#handleDeleteRequest(request, response, (configContent) => {
        for (let configIndex = 0; configIndex < configContent.length; configIndex++) {
          const currentConfig = configContent[configIndex];
          for (let groupIndex = 0; groupIndex < currentConfig.groups.length; groupIndex++) {
            const currentGroup = currentConfig.groups[groupIndex];
            for (let observerIndex = 0; observerIndex < currentGroup.observers.length; observerIndex++) {
              if (currentGroup.observers[observerIndex].path === request.query.path) {
                if (currentGroup.observers.length === 1) {
                  return { found: undefined, reason: "Cannot delete last group observer" };
                }
                return { found: { parent: currentGroup.observers, index: observerIndex }, reason: undefined };
              }
            }
          }
        }
        return { found: undefined, reason: "Could not find the item to delete" };
      });
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
   * Method containing common logic used to handle PUT requests
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} parent The function used to get the parent of the body content
   * @param {Function} index The function used to get the index of the element to edit
   */
  #handlePutRequest(request, response, parent, index) {
    const paramsValidation = this.#validateQueryParams(request.method, request.url, request.query);
    if (!paramsValidation.valid) {
      response.status(400).json(paramsValidation.cause);
      return;
    }
    const bodyValidation = this.#validateBody(request.url, request.body);
    if (!bodyValidation.content) {
      response.status(400).json(bodyValidation.cause);
      return;
    }
    const updateResult = this.#updateConfig((initalConfig) => {
      const contentParent = parent(initalConfig);
      if (!contentParent) {
        return { success: false, message: "Undefined parent of new element" };
      }
      const editIndex = index(contentParent);
      if (editIndex < 0) {
        return { success: false, message: "Could not find the specifed element" };
      }
      const queryIdentifier = contentParent[editIndex].getIdentifier();
      const bodyIdentifier = bodyValidation.content.getIdentifier();
      if (queryIdentifier !== bodyIdentifier) {
        return {
          success: false,
          message: `Incompatible query (${queryIdentifier}) and body (${bodyIdentifier}) identifiers`,
        };
      }
      try {
        // we must try to copy values because assigning new object will NOT update the main config reference
        contentParent[editIndex].copyValues(bodyValidation.content);
        return {
          success: true,
          message: `Edited configuration element with ${contentParent[editIndex].getIdentifier()}`,
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    });
    response.status(updateResult.status).send(updateResult.message);
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
    const bodyValidation = this.#validateBody(request.url, request.body);
    if (!bodyValidation.content) {
      response.status(400).json(bodyValidation.cause);
      return;
    }
    const addResult = this.#updateConfig((initalConfig) => {
      const contentParent = parent(initalConfig);
      if (!contentParent) {
        return { success: false, message: "Undefined parent of new element" };
      }
      const newIdentifier = bodyValidation.content.getIdentifier();
      if (contentParent.findIndex((item) => item.getIdentifier() === newIdentifier) >= 0) {
        return { success: false, message: `Element with identifier ${newIdentifier} already exists` };
      }
      contentParent.push(bodyValidation.content);
      return { success: true, message: "Added new configuration element" };
    });
    response.status(addResult.status).send(addResult.message);
  }

  #handleDeleteRequest(request, response, index) {
    const paramsValidation = this.#validateQueryParams(request.method, request.url, request.query);
    if (!paramsValidation.valid) {
      response.status(400).json(paramsValidation.cause);
      return;
    }
    const deleteResult = this.#updateConfig((initalConfig) => {
      const indexResult = index(initalConfig);
      if (!indexResult.found) {
        return { success: false, message: indexResult.reason };
      }
      const removedItem = indexResult.found.parent.splice(indexResult.found.index, 1);
      return { success: true, message: `Removed item with ${removedItem.at(0).getIdentifier()}` };
    });
    response.status(deleteResult.status).send(deleteResult.message);
  }

  /**
   * Method used to validate the config router endpoint query parameters
   * @param {String} method The endpoint method for which we want to check parameters
   * @param {String} url The endpoint URL address (containing only the path)
   * @param {Object} params The query parameters which should be validated
   * @returns an object with validation result (true/false) and an optional cause (if validation NOK)
   */
  #validateQueryParams(method, url, params) {
    const paramsValidator = new Map([
      ["/", ScrapConfig.getQueryParams(method)],
      ["/groups", ScrapGroup.getQueryParams(method)],
      ["/groups/observers", ScrapObserver.getQueryParams(method)],
      ["/groups/observers/components", ScrapComponent.getQueryParams(method)],
    ]).get(url.indexOf("?") > 0 ? url.substring(0, url.indexOf("?")) : url);
    const paramsValidate = new Ajv().compile(paramsValidator);
    return { valid: paramsValidate(params), cause: paramsValidate.errors };
  }

  /**
   * Method used to validate request body for correct config object
   * @param {String} url The endpoint URL address (containing only the path)
   * @param {Object} requestBody The object which shoulde be validated
   * @returns the parsed and validated config if ok, error cause otherwise
   */
  #validateBody(url, requestBody) {
    // select appropriate body validator from specified URL path
    const bodyValidator = new Map([
      ["/", { schema: ScrapConfig.getSchema(), value: new ScrapConfig(requestBody) }],
      ["/groups", { schema: ScrapGroup.getSchema(), value: new ScrapGroup(requestBody) }],
      ["/groups/observers", { schema: ScrapObserver.getSchema(), value: new ScrapObserver(requestBody) }],
    ]).get(url.indexOf("?") > 0 ? url.substring(0, url.indexOf("?")) : url);
    // validate JSON structure of the request body content
    const schemaValidate = new Ajv().compile(bodyValidator.schema);
    if (!schemaValidate(requestBody)) {
      return { content: undefined, cause: schemaValidate.errors };
    }
    // validate JSON values of the request body content
    const parsedBody = bodyValidator.value;
    const valueValidate = parsedBody.checkValues().errors;
    if (valueValidate.length > 0) {
      return { content: undefined, cause: valueValidate[0] };
    }
    return { content: parsedBody, cause: undefined };
  }

  /**
   * Method used to update the configuration file with the provided logic
   * @param {Function} update The update logic to apply when altering config file (add, edit, or delete)
   */
  #updateConfig(update) {
    try {
      const configDirectory = path.dirname(this.#configFilePath);
      if (!fs.existsSync(configDirectory)) {
        fs.mkdirSync(configDirectory, { recursive: true });
      }
      const configContent = JSON.parse(fs.readFileSync(this.#configFilePath)).map((item) => new ScrapConfig(item));
      const updateStatus = update(configContent);
      if (updateStatus.success) {
        fs.writeFileSync(this.#configFilePath, JSON.stringify(configContent, null, 2));
      }
      return { status: updateStatus.success ? 200 : 400, message: updateStatus.message };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}

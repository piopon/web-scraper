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
    router.get("/", async (request, response) => {
      await this.#handleGetRequest(request, response, (configContent) => configContent);
    });
    router.get("/groups", async (request, response) => {
      await this.#handleGetRequest(request, response, (configContent) =>
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
    router.get("/groups/observers", async (request, response) => {
      await this.#handleGetRequest(request, response, (configContent) =>
        configContent
          .flatMap((item) => item.groups)
          .flatMap((item) => item.observers)
          .filter((item) => {
            const nameOk = request.query.name ? item.name === request.query.name : true;
            const pathOk = request.query.path ? item.path === request.query.path : true;
            const targetOk = request.query.target ? item.target === request.query.target : true;
            const historyOk = request.query.history ? item.history === request.query.history : true;
            return nameOk && pathOk && targetOk && historyOk;
          })
      );
    });
    router.get("/groups/observers/components", async (request, response) => {
      await this.#handleGetRequest(request, response, (configContent) =>
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
    router.put("/", async (request, response) => {
      await this.#handlePutRequest(
        request,
        response,
        (configContent) => configContent,
        (parent) => {
          return parent.findIndex((item) => (request.query.user ? item.user === request.query.user : false));
        }
      );
    });
    router.put("/groups", async (request, response) => {
      await this.#handlePutRequest(
        request,
        response,
        (configContent) => configContent.flatMap((item) => item.groups),
        (parent) => {
          return parent.findIndex((item) => (request.query.name ? item.name === request.query.name : false));
        }
      );
    });
    router.put("/groups/observers", async (request, response) => {
      await this.#handlePutRequest(
        request,
        response,
        (configContent) => configContent.flatMap((item) => item.groups).flatMap((item) => item.observers),
        (parent) => {
          return parent.findIndex((item) => (request.query.name ? item.name === request.query.name : false));
        }
      );
    });
  }

  /**
   * Method used to create POST method routes and add them to the router object
   * @param {Object} router The router object with POST method routes defined
   */
  #createPostRoutes(router) {
    router.post("/", async (request, response) => {
      await this.#handlePostRequest(request, response, (configContent) => configContent);
    });
    router.post("/groups", async (request, response) => {
      await this.#handlePostRequest(request, response, (configContent) => configContent.groups);
    });
    router.post("/groups/observers", async (request, response) => {
      await this.#handlePostRequest(request, response, (configContent) => {
        const parentGroup = configContent
          .flatMap((config) => config.groups)
          .filter((group) => group.name === request.query.parent);
        return parentGroup.length > 0 ? parentGroup.at(0).observers : undefined;
      });
    });
  }

  /**
   * Method used to create DELETE method routes and add them to the router object
   * @param {Object} router The router object with DELETE method routes defined
   */
  #createDeleteRoutes(router) {
    router.delete("/", async (request, response) => {
      await this.#handleDeleteRequest(request, response, (configContent) => {
        const details = this.#getParentDetails(configContent, { configUser: request.query.user });
        return details
          ? { found: { parent: details.parent, index: details.index }, reason: undefined }
          : { found: undefined, reason: "Could not find item to delete" };
      });
    });
    router.delete("/groups", async (request, response) => {
      await this.#handleDeleteRequest(request, response, (configContent) => {
        const details = this.#getParentDetails(configContent, { groupName: request.query.name });
        return details
          ? { found: { parent: details.parent, index: details.index }, reason: undefined }
          : { found: undefined, reason: "could not find item to delete" };
      });
    });
    router.delete("/groups/observers", async (request, response) => {
      await this.#handleDeleteRequest(request, response, (configContent) => {
        const details = this.#getParentDetails(configContent, { observerName: request.query.name });
        return details
          ? { found: { parent: details.parent, index: details.index }, reason: undefined }
          : { found: undefined, reason: "Could not find item to delete" };
      });
    });
  }

  /**
   * Method containing common logic used to handle GET requests
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} filter The function using query and path params to return appropriate data
   */
  async #handleGetRequest(request, response, filter) {
    const validationResult = this.#validateQueryParams(request.method, request.url, request.query);
    if (!validationResult.valid) {
      response.status(400).json(validationResult.cause);
      return;
    }
    const configContent = request.user.config == null
      ? await ScrapConfig.getDatabaseModel().create({ user: user._id })
      : await ScrapConfig.getDatabaseModel().findById(request.user.config);
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
  async #handlePutRequest(request, response, parent, index) {
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
    const updateResult = await this.#updateConfig(request.user, (initalConfig) => {
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
    response.status(updateResult.status).json(updateResult.message);
  }

  /**
   * Method containing common logic used to handle POST requests
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} parent The function used to get the parent of the body content
   */
  async #handlePostRequest(request, response, parent) {
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
    const addResult = await this.#updateConfig(request.user, (initalConfig) => {
      const contentParent = parent(initalConfig);
      if (!contentParent) {
        return { success: false, message: "Undefined parent of new element" };
      }
      const newIdentifier = bodyValidation.content.getIdentifier();
      if (contentParent.findIndex((item) => item.getIdentifier() === newIdentifier) >= 0) {
        return { success: false, message: `Element with identifier ${newIdentifier} already exists` };
      }
      contentParent.push(bodyValidation.content);
      return { success: true, message: `Added new configuration element with ${newIdentifier}` };
    });
    response.status(addResult.status).json(addResult.message);
  }

  /**
   * Method containing common logic used to handle DELETE requests
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} index The function used to get the parent and index of the element to delete
   */
  async #handleDeleteRequest(request, response, index) {
    const paramsValidation = this.#validateQueryParams(request.method, request.url, request.query);
    if (!paramsValidation.valid) {
      response.status(400).json(paramsValidation.cause);
      return;
    }
    const deleteResult = await this.#updateConfig(request.user, (initalConfig) => {
      const indexResult = index(initalConfig);
      if (!indexResult.found) {
        return { success: false, message: indexResult.reason };
      }
      const removedItem = indexResult.found.parent.splice(indexResult.found.index, 1);
      return { success: true, message: `Removed configuration element with ${removedItem.at(0).getIdentifier()}` };
    });
    response.status(deleteResult.status).json(deleteResult.message);
  }

  /**
   * Method used to receive the specified config, group, or observer parent and index
   * @param {Object} fullConfig The full config object which we want to search through
   * @param {Object} object The searched object identifier for which we want to get parent details
   * @returns parent of the searched object and the index of the object in parent
   */
  #getParentDetails(fullConfig, { configUser = undefined, groupName = undefined, observerName = undefined }) {
    for (let configIndex = 0; configIndex < fullConfig.length; configIndex++) {
      const currentConfig = fullConfig[configIndex];
      if (configUser && configUser === currentConfig.user) {
        return { parent: fullConfig, index: configIndex };
      }
      for (let groupIndex = 0; groupIndex < currentConfig.groups.length; groupIndex++) {
        const currentGroup = currentConfig.groups[groupIndex];
        if (groupName && groupName === currentGroup.name) {
          return { parent: currentConfig.groups, index: groupIndex };
        }
        for (let observerIndex = 0; observerIndex < currentGroup.observers.length; observerIndex++) {
          const currentObserver = currentGroup.observers[observerIndex];
          if (observerName && observerName === currentObserver.name) {
            return { parent: currentGroup.observers, index: observerIndex };
          }
        }
      }
    }
    return undefined;
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
      ["/", ScrapConfig.getRequestParamsSchema(method)],
      ["/groups", ScrapGroup.getRequestParamsSchema(method)],
      ["/groups/observers", ScrapObserver.getRequestParamsSchema(method)],
      ["/groups/observers/components", ScrapComponent.getRequestParamsSchema(method)],
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
      ["/", { schema: ScrapConfig.getRequestBodySchema(), value: new ScrapConfig(requestBody) }],
      ["/groups", { schema: ScrapGroup.getRequestBodySchema(), value: new ScrapGroup(requestBody) }],
      ["/groups/observers", { schema: ScrapObserver.getRequestBodySchema(), value: new ScrapObserver(requestBody) }],
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
  async #updateConfig(user, update) {
    try {
      // get initial config content: either a new one or an existing from user object
      const configContent = user.config == null
        ? await ScrapConfig.getDatabaseModel().create({ user: user._id })
        : await ScrapConfig.getDatabaseModel().findById(user.config);
      // perform update operation
      const updateStatus = update(configContent);
      if (updateStatus.success) {
        configContent.save();
        // if we've created a new blank configuration then we must link it in the user
        if (user.config == null) {
          user.config = configContent._id;
          user.save();
        }
      }
      return { status: updateStatus.success ? 200 : 400, message: updateStatus.message };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}

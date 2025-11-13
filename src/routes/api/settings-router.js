import { ComponentType } from "../../config/app-types.js";
import { ScrapConfig } from "../../model/scrap-config.js";

import Ajv from "ajv";
import express from "express";

export class SettingsRouter {
  #components = undefined;

  /**
   * Creates a new settings router for managing scraper application settings
   * @param {Object} components The web components object used in settings router
   */
  constructor(components) {
    this.#components = components;
  }

  /**
   * Method used to create routes for settings adjustment values
   * @returns router object for handling settings requests
   */
  createRoutes() {
    const router = express.Router();
    router.get("/features", (request, response) => {
      const validationResult = this.#validateQueryParams(request.query);
      if (!validationResult.valid) {
        response.status(400).json(validationResult.cause);
        return;
      }
      const outputData = {
        demo: process.env.DEMO_USER && process.env.DEMO_PASS ? true : false,
        google: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? true : false,
        monitor: process.env.MONITOR_ADDRESS ? true : false,
        database: process.env.DB_ADDRESS,
        challenge: process.env.CHALLENGE_JOIN && process.env.CHALLENGE_EOL_MINS ? true : false,
      };
      response.status(200).json(outputData);
    });
    router.post("/import", async (request, response) => {
      const validationResult = this.#validateQueryParams(request.query);
      if (!validationResult.valid) {
        response.status(400).json(validationResult.cause);
        return;
      }
      const bodyValidation = this.#validateBody(request.body);
      if (!bodyValidation.content) {
        response.status(400).json(bodyValidation.cause);
        return;
      }
      const importResult = await this.#importConfig(request.user, bodyValidation.content);
      response.status(importResult.status).json(importResult.message);
    });
    return router;
  }

  /**
   * Method used to validate the settings router endpoint query parameters
   * @param {Object} params The query parameters which should be validated
   * @returns an object with validation result (true/false) and an optional cause (if validation NOK)
   */
  #validateQueryParams(params) {
    const queryValidation = new Ajv().compile({
      type: "object",
      additionalProperties: false,
    });
    return { valid: queryValidation(params), cause: queryValidation.errors };
  }

  /**
   * Method used to validate request body for correct settings object
   * @param {Object} requestBody The object which shoulde be validated
   * @returns the parsed and validated config if ok, error cause otherwise
   */
  #validateBody(requestBody) {
    // validate JSON structure of the request body content
    const schemaValidate = new Ajv().compile(ScrapConfig.getRequestBodySchema());
    if (!schemaValidate(requestBody)) {
      return { content: undefined, cause: schemaValidate.errors };
    }
    // validate JSON values of the request body content
    const parsedBody = new ScrapConfig(requestBody);
    const valueValidate = parsedBody.checkValues().errors;
    if (valueValidate.length > 0) {
      return { content: undefined, cause: valueValidate[0] };
    }
    return { content: parsedBody, cause: undefined };
  }

  /**
   * Method handling the core import configuration action
   * @param {Object} user The user for which we want to import configuration
   * @param {Object} config The configuration to be imported for specified user
   * @returns the import action status and message with in-depth details
   */
  async #importConfig(user, config) {
    try {
      // get inital config content from user object (every registered user will have one)
      const configContent = await ScrapConfig.getDatabaseModel().findById(user.config);
      try {
        configContent.groups = [];
        config.groups.forEach((group) => configContent.groups.push(group));
        configContent.user = user._id;
        await configContent.save();
        this.#components.runComponents(ComponentType.CONFIG, "update", user, configContent);
        return { status: 200, message: `Imported configuration for user ${user.name}` };
      } catch (error) {
        return { status: 400, message: error.message };
      }
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}

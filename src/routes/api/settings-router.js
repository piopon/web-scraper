import { ComponentType } from "../../config/app-types.js";
import { ScrapConfig } from "../../model/scrap-config.js";

import Ajv from "ajv";
import express from "express";

export class SettingsRouter {
  #components = undefined;

  constructor(components) {
    this.#components = components;
  }

  createRoutes() {
    const router = express.Router();
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

  #validateQueryParams(params) {
    const queryValidation = new Ajv().compile({
      type: "object",
      additionalProperties: false,
    });
    return { valid: queryValidation(params), cause: queryValidation.errors };
  }

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

  async #importConfig(user, config) {
    try {
      // get inital config content from user object (every registered user will have one)
      const configContent = await ScrapConfig.getDatabaseModel().findById(user.config);
      try {
        configContent.groups = [];
        config.groups.forEach(group => configContent.groups.push(group));
        configContent.user = user._id;
        await configContent.save();
        this.#components.runComponents(ComponentType.CONFIG, "update", user, configContent);
        return { status: 200 , message: `Imported configuration for user ${user.name}` };
      } catch (error) {
        return { status: 400, message: error.message };
      }
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}

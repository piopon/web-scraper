import { ScrapConfig } from "../../model/scrap-config.js";

import Ajv from "ajv";
import express from "express";

export class SettingsRouter {
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
      response.status(200).json("OK");
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
}

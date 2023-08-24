import Ajv from "ajv";
import express from "express";

export class StatusRouter {
  #serverStatus = undefined;
  #components = undefined;

  /**
   * Creates a new status router for configuring appropriate endpoints
   * @param {Object} serverStatus The web server status logger object
   * @param {Array} components The array of components which status we want to receive
   */
  constructor(serverStatus, components) {
    this.#serverStatus = serverStatus;
    this.#components = components;
  }

  /**
   * Method used to create routes for components status values
   * @returns router object for handling status requests
   */
  createRoutes() {
    const router = express.Router();
    router.get("/", (request, response) => {
      const validationResult = this.#validateQueryParams(request.query);
      if (!validationResult.valid) {
        response.status(400).json(validationResult.cause);
        return;
      }
      const showHistory = request.query.history ? request.query.history : false;
      const outputData = this.#components
        .filter((component) => (request.query.name ? component.getName().trim() === request.query.name : true))
        .map((component) => {
          return {
            name: component.getName(),
            alive: component.isAlive(),
            history: showHistory ? component.getStatusHistory() : undefined,
          };
        });
      if (!request.query.name || this.#serverStatus.getName().trim() === request.query.name) {
        outputData.push({
          name: this.#serverStatus.getName(),
          alive: true,
          history: showHistory ? this.#serverStatus.getHistory() : undefined,
        })
      }
      response.status(200).json(outputData);
    });
    return router;
  }

  #validateQueryParams(params) {
    const queryValidation = new Ajv().compile({
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        history: { type: "boolean" },
      },
    });
    return { valid: queryValidation(params), cause: queryValidation.errors };
  }
}

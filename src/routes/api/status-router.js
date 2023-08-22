import express from "express";

export class StatusRouter {
  #components = undefined;

  /**
   * Creates a new status router for configuring appropriate endpoints
   * @param {Array} components The array of components which status we want to receive
   */
  constructor(components) {
    this.#components = components;
  }

  /**
   * Method used to create routes for components status values
   * @returns router object for handling status requests
   */
  createRoutes() {
    const router = express.Router();
    router.get("/", (request, response) => {
      const outputData = [{ name: "web-server", alive: true }];
      for (let componentIndex = 0; componentIndex < this.#components.length; componentIndex++) {
        const component = this.#components[componentIndex];
        outputData.push({
          name: component.getName(),
          alive: component.isAlive(),
        });
      }
      response.status(200).json(outputData);
    });
    return router;
  }
}

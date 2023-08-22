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
      const outputData = [{ name: this.#serverStatus.getName(), alive: true }];
      for (let componentIndex = 0; componentIndex < this.#components.length; componentIndex++) {
        const component = this.#components[componentIndex];
        outputData.push({
          name: component.getName(),
          alive: component.isAlive(),
        });
      }
      response.status(200).json(outputData);
    });
    router.get("/history", (request, response) => {
      const outputData = [
        {
          name: this.#serverStatus.getName(),
          alive: true,
          history: this.#serverStatus.getHistory(),
        },
      ];
      for (let componentIndex = 0; componentIndex < this.#components.length; componentIndex++) {
        const component = this.#components[componentIndex];
        outputData.push({
          name: component.getName(),
          alive: component.isAlive(),
          history: component.getStatusHistory(),
        });
      }
      response.status(200).json(outputData);
    });
    return router;
  }
}

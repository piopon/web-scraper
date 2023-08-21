import express from "express";

export class StatusRouter {
  #components = undefined;

  constructor(components) {
    this.#components = components;
  }

  createRoutes() {
    const router = express.Router();
    router.get("/", (request, response) => {
      const outputData = [];
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

import express from "express";

export class StatusRouter {
  #components = undefined;

  constructor(components) {
    this.#components = components;
  }

  createRoutes() {
    const router = express.Router();
    router.get("/", (request, response) => {
        response.status(200).send("STATUSES");
    });
    return router;
  }
}

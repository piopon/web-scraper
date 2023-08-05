import { DataRouter } from "../routes/api/data.js";
import { StatusLogger } from "./status-logger.js";

import express from "express";

export class WebServer {
  static #LOGGER_NAME = "web-server ";

  #status = new StatusLogger(WebServer.#LOGGER_NAME);
  #setupConfig = undefined;
  #components = [];
  #server = undefined;

  constructor(config) {
    this.#setupConfig = config;
    this.#server = express();
    this.#server.use("/api/v1/data", DataRouter.createRoutes())
  }

  addComponent(component) {
    this.#components.push(component);
  }

  start() {
    this.#server.listen(this.#setupConfig.serverConfig.port, () => {
      this.#components.forEach(component => component.start());
      this.#status.log(`Started on port: ${this.#setupConfig.serverConfig.port}`);
    });
  }
}

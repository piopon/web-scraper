import { DataRouter } from "../routes/api/data.js";
import { StatusLogger } from "./status-logger.js";

import express from "express";

export class WebServer {
  static #LOGGER_NAME = "web-server ";

  #status = new StatusLogger(WebServer.#LOGGER_NAME);
  #serverConfig = undefined;
  #server = undefined;

  constructor(config) {
    this.#serverConfig = config;
    this.#server = express();
    this.#server.use("/api/v1/data", DataRouter.createRoutes())
  }

  start() {
    this.#server.listen(this.#serverConfig.port, () => {
      this.#status.log(`Started on port: ${this.#serverConfig.port}`);
    });
  }
}

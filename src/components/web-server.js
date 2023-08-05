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
  }

  addComponent(component) {
    this.#components.push(component);
  }

  run() {
    this.#server = this.#initializeServer();
    this.#server.listen(this.#setupConfig.serverConfig.port, () => {
      this.#components.forEach(component => component.start());
      this.#status.log(`Started on port: ${this.#setupConfig.serverConfig.port}`);
    });
  }

  #initializeServer() {
    // create web server object
    const server = express();
    // setup web server routes
    const routes = new Map([
      ["/api/v1/data", new DataRouter(this.#setupConfig.dataOutputPath)],
    ]);
    routes.forEach((router, url) => server.use(url, router.createRoutes()));

    return server;
  }
}

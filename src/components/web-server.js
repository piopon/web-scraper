import { DataRouter } from "../routes/api/data-router.js";
import { StatusLogger } from "./status-logger.js";

import express from "express";

export class WebServer {
  static #LOGGER_NAME = "web-server ";

  #status = new StatusLogger(WebServer.#LOGGER_NAME);
  #setupConfig = undefined;
  #components = [];
  #server = undefined;

  /**
   * Creates a new web server with specified configuration
   * @param {Object} config The object containing server configuration
   */
  constructor(config) {
    this.#setupConfig = config;
  }

  /**
   * Method used to add a component to start after running web server
   * @param {Object} component The component to start after running web server
   */
  addComponent(component) {
    this.#components.push(component);
  }

  /**
   * Method used to initialize and run the web server
   */
  run() {
    this.#server = this.#initializeServer();
    this.#server.listen(this.#setupConfig.serverConfig.port, () => {
      this.#components.forEach((component) => component.start());
      this.#status.log(`Started on port: ${this.#setupConfig.serverConfig.port}`);
    });
  }

  /**
   * Method used to gracefully shutdown the web server
   */
  shutdown() {
    this.#server.close(() => {
      this.#components.forEach((component) => component.stop());
      this.#status.log("Stopped");
    });
  }

  /**
   * Method used to create and intialize a new server instance
   * @returns created and initialzied server object
   */
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

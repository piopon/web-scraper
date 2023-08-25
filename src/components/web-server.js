import { ParamsParser } from "../middleware/params-parser.js";
import { RequestLogger } from "../middleware/request-logger.js";
import { ConfigRouter } from "../routes/api/config-router.js";
import { DataRouter } from "../routes/api/data-router.js";
import { StatusRouter } from "../routes/api/status-router.js";
import { StatusLogger } from "./status-logger.js";
import { ViewRouter } from "../routes/view/view-router.js";

import express from "express";
import { engine } from 'express-handlebars';

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
    // setup web server template engine
    server.engine('handlebars', engine());
    server.set('view engine', 'handlebars');
    server.set('views', './public');
    // setup web server middleware
    server.use(ParamsParser.middleware);
    server.use(RequestLogger.middleware(this.#status));
    server.use(express.json());
    // setup web server routes
    const routes = new Map([
      ["/", new ViewRouter()],
      ["/api/v1/data", new DataRouter(this.#setupConfig.dataOutputPath)],
      ["/api/v1/configs", new ConfigRouter(this.#setupConfig.dataConfigPath)],
      ["/api/v1/status", new StatusRouter(this.#status, this.#components)],
    ]);
    routes.forEach((router, url) => server.use(url, router.createRoutes()));

    return server;
  }
}

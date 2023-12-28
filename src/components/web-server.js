import { ParamsParser } from "../middleware/params-parser.js";
import { RequestLogger } from "../middleware/request-logger.js";
import { ConfigRouter } from "../routes/api/config-router.js";
import { DataRouter } from "../routes/api/data-router.js";
import { StatusRouter } from "../routes/api/status-router.js";
import { StatusLogger } from "./status-logger.js";
import { ViewRouter } from "../routes/view/view-router.js";

import express from "express";
import passport from "passport";
import flash from "express-flash";
import session from "express-session";
import helpers from "handlebars-helpers";
import { engine } from "express-handlebars";

export class WebServer {
  static #LOGGER_NAME = "web-server ";

  #setupConfig = undefined;
  #components = [];
  #server = undefined;
  #status = undefined;

  /**
   * Creates a new web server with specified configuration
   * @param {Object} config The object containing server configuration
   */
  constructor(config) {
    this.#setupConfig = config;
    this.#status = new StatusLogger(WebServer.#LOGGER_NAME, config.minLogLevel);
    this.#status.info("Created");
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
      this.#status.info(`Started on port: ${this.#setupConfig.serverConfig.port}`);
    });
  }

  /**
   * Method used to gracefully shutdown the web server
   */
  shutdown() {
    this.#server.close(() => {
      this.#components.forEach((component) => component.stop());
      this.#status.info("Stopped");
    });
  }

  /**
   * Method used to create and intialize a new server instance
   * @returns created and initialzied server object
   */
  #initializeServer() {
    // create web server object
    const server = express();
    // setup web server template engine and all options for UI
    server.engine("handlebars", engine({ helpers: helpers() }));
    server.set("view engine", "handlebars");
    server.set("views", "./public");
    server.use(express.static("./public"));
    // setup web server middleware
    server.use(ParamsParser.middleware);
    server.use(RequestLogger.middleware(this.#status));
    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));
    server.use(flash());
    server.use(session({ secret: "SECRET", resave: false, saveUninitialized: false }));
    server.use(passport.initialize());
    server.use(passport.session());
    // setup web server routes
    const routes = new Map([
      ["/", new ViewRouter(this.#setupConfig.dataConfigPath, passport)],
      ["/api/v1/data", new DataRouter(this.#setupConfig.dataOutputPath)],
      ["/api/v1/configs", new ConfigRouter(this.#setupConfig.dataConfigPath)],
      ["/api/v1/status", new StatusRouter(this.#status, this.#components)],
    ]);
    routes.forEach((router, url) => server.use(url, router.createRoutes()));

    return server;
  }
}

import { AuthRouter } from "../routes/view/auth-router.js";
import { ComponentType } from "../../config/app-types.js";
import { ConfigRouter } from "../routes/api/config-router.js";
import { DataRouter } from "../routes/api/data-router.js";
import { ParamsParser } from "../middleware/params-parser.js";
import { RequestLogger } from "../middleware/request-logger.js";
import { StatusRouter } from "../routes/api/status-router.js";
import { StatusLogger } from "./status-logger.js";
import { ViewRouter } from "../routes/view/view-router.js";

import cors from "cors"
import express from "express";
import passport from "passport";
import flash from "express-flash";
import session from "express-session";
import fileUpload from "express-fileupload";
import helpers from "handlebars-helpers";
import { engine } from "express-handlebars";

export class WebServer {
  static #LOGGER_NAME = "web-server    ";

  #setupConfig = undefined;
  #components = undefined;
  #server = undefined;
  #handle = undefined;
  #status = undefined;

  /**
   * Creates a new web server with specified configuration
   * @param {Object} config The object containing server configuration
   * @param {Object} components The object containing all server dependent components
   */
  constructor(config, components) {
    this.#setupConfig = config;
    this.#components = components;
    this.#status = new StatusLogger(WebServer.#LOGGER_NAME, config.minLogLevel);
    this.#status.info("Created");
  }

  /**
   * Method used to initialize and run the web server
   */
  async run() {
    if (!(await this.#components.initComponents(ComponentType.INIT))) {
      return false;
    }
    this.#server = this.#initializeServer();
    this.#handle = this.#server.listen(this.#setupConfig.serverConfig.port, () => {
      this.#status.info(`Started on port: ${this.#setupConfig.serverConfig.port}`);
    });
    return true;
  }

  /**
   * Method used to gracefully shutdown the web server
   */
  shutdown() {
    if (this.#handle == null) {
      return;
    }
    this.#handle.close(() => {
      this.#components.getComponents().forEach((component) => component.master.stop());
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
    server.use(fileUpload({
      abortOnLimit: true,
      limits: {
        fileSize: 10_000_000,
      }
    }));
    server.use(session(this.#getSessionConfiguration()));
    server.use(passport.initialize());
    server.use(passport.session());
    server.use(cors(this.#getCorsConfiguration()))
    // setup web server routes
    const routes = new Map([
      ["/", new ViewRouter(this.#setupConfig.usersDataPath)],
      ["/auth", new AuthRouter(this.#components, passport)],
      ["/api/v1/data", new DataRouter(this.#setupConfig.usersDataPath)],
      ["/api/v1/config", new ConfigRouter(this.#components)],
      ["/api/v1/status", new StatusRouter(this.#status, this.#components)],
    ]);
    routes.forEach((router, url) => server.use(url, router.createRoutes()));

    return server;
  }

  /**
   * Method used to retrieve session configuration object
   * @returns session configuration object
   */
  #getSessionConfiguration() {
    return {
      secret: process.env.SESSION_SHA,
      resave: false,
      saveUninitialized: false,
    };
  }

  /**
   * Method used to retrieve CORS configuration object
   * @returns CORS configuration object
   */
  #getCorsConfiguration() {
    return {
      origin: true,
      credentials: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'X-AUTHENTICATION', 'X-IP', 'Content-Type', 'Accept'],
    };
  }
}

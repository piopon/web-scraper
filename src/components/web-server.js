import { AuthRouter } from "../routes/view/auth-router.js";
import { ComponentType } from "../../config/app-types.js";
import { ConfigRouter } from "../routes/api/config-router.js";
import { DataRouter } from "../routes/api/data-router.js";
import { ParamsParser } from "../middleware/params-parser.js";
import { RequestLogger } from "../middleware/request-logger.js";
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
  static #LOGGER_NAME = "web-server  ";

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
  async addComponent(component) {
    const componentTypes = component.getInfo().types;
    if (componentTypes.length === 0) {
      this.#status.warning(`Missing component type(s): ${component}`);
    }
    const componentMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(component));
    for (const componentType of componentTypes) {
      const requiredMethods = componentType.methods;
      if (!requiredMethods.every((method) => componentMethods.includes(method))) {
        this.#status.error(`Incompatible component: ${component.getName()}`);
        throw new Error("Cannot initialize server. Check previous logs for more information.");
      }
    }
    if (componentTypes.includes(ComponentType.SLAVE)) {
      const newMaster = component.getMaster();
      const master = this.#components.find((c) => c.master.getName() === newMaster.name);
      if (master != null) {
        master.slave = component;
      }
      if (1 === componentTypes.length) {
        return;
      }
    }
    this.#components.push({ master: component, slave: undefined });
  }

  /**
   * Method used to initialize and run the web server
   */
  async run() {
    if (!(await this.#runComponents())) {
      return;
    }
    this.#server = this.#initializeServer();
    this.#server.listen(this.#setupConfig.serverConfig.port, () => {
      this.#status.info(`Started on port: ${this.#setupConfig.serverConfig.port}`);
    });
  }

  /**
   * Method used to gracefully shutdown the web server
   */
  shutdown() {
    this.#server.close(() => {
      this.#components.forEach((component) => component.master.stop());
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
    server.use(session(this.#getSessionConfiguration()));
    server.use(passport.initialize());
    server.use(passport.session());
    // filter out components needed by particular routers
    const authComponents = this.#getComponents(ComponentType.AUTH);
    const configComponents = this.#getComponents(ComponentType.CONFIG);
    // setup web server routes
    const routes = new Map([
      ["/", new ViewRouter()],
      ["/auth", new AuthRouter(authComponents, passport)],
      ["/api/v1/data", new DataRouter(this.#setupConfig.usersDataPath)],
      ["/api/v1/config", new ConfigRouter(configComponents)],
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
   * Method used to filter all components and return the one with desired type
   * @param {Object} type The type of components that we want to receive
   * @returns array of components of specified type
   */
  #getComponents(type) {
    return this.#components.filter((component) => {
      return -1 !== component.master.getInfo().types.findIndex((currType) => currType.equals(type));
    });
  }

  /**
   * Method used to initialize and start server-related components
   * @returns true if all components are invoked, false if at least one has an error
   */
  async #runComponents() {
    const initComponents = this.#getComponents(ComponentType.INIT);
    for (const component of initComponents) {
      // if component is not required to pass then we start it and go to the next one
      if (!component.master.getInfo().initWait) {
        component.master.start().then(async (initialized) => {
          // if component is initialized and has slave then run after initialization action
          if (initialized && component.slave != null) {
            component.slave.getMaster().actions.afterInit();
          }
        });
        continue;
      }
      // component must pass so we are waiting for the result to check it
      const result = await component.master.start();
      if (!result) {
        this.#status.error(`Cannot start component: ${component.getName()}`);
        return false;
      }
      // call the dependent component (if there is one)
      if (component.slave != null) {
        await component.slave.getMaster().actions.afterInit();
      }
    }
    return true;
  }
}

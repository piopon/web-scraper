import { ComponentStatus, ComponentType } from "../../config/app-types.js";
import { StatusLogger } from "./status-logger.js";

import mongoose from "mongoose";

export class WebDatabase {
  static #COMPONENT_NAME = "web-database  ";

  #status = undefined;
  #dbConfig = undefined;

  /**
   * Creates a new web database from the specified configuration
   * @param {Object} config The object containing database configuration values
   */
  constructor(config) {
    this.#dbConfig = config.databaseConfig;
    this.#status = new StatusLogger(WebDatabase.#COMPONENT_NAME, config.minLogLevel);
    this.#status.info("Created");
  }

  /**
   * Method used to start database connection
   */
  async start() {
    try {
      const dbUrl = `mongodb://${this.#dbConfig.url}:${this.#dbConfig.port}`;
      const dbOptions = {
        appName: this.#dbConfig.name,
        dbName: this.#dbConfig.name,
        user: this.#dbConfig.user,
        pass: this.#dbConfig.password,
        serverSelectionTimeoutMS: this.#dbConfig.timeout,
        connectTimeoutMS: this.#dbConfig.timeout,
        family: 4,
      };
      await mongoose.connect(dbUrl, dbOptions);
      this.#status.info("Connected to database");
      return true;
    } catch (error) {
      this.#status.error(error);
      return false;
    }
  }

  /**
   * Method used to stop database operations and disconnect
   */
  async stop() {
    mongoose.disconnect();
  }

  getStatus() {
    if (1 === mongoose.connection.readyState) {
      return ComponentStatus.RUNNING;
    } else if (2 === mongoose.connection.readyState) {
      return ComponentStatus.INITIALIZING;
    } else {
      return ComponentStatus.STOPPED;
    }
  }

  /**
   * Method used to return the name of the component
   * @returns web database component name
   */
  getName() {
    return WebDatabase.#COMPONENT_NAME;
  }

  /**
   * Method used to receive additional info components
   * @returns an object with extra info: component type and require pass flag
   */
  getInfo() {
    return { types: [ComponentType.INIT], initWait: false };
  }

  /**
   * Method used to receive running history status of web database
   * @returns array of objects containing web database running history status
   */
  getHistory() {
    return this.#status.getHistory();
  }
}

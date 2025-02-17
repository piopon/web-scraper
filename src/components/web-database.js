import { ComponentStatus, ComponentType } from "../config/app-types.js";
import { ScrapConfig } from "../model/scrap-config.js";
import { ScrapUser } from "../model/scrap-user.js";
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
      if (false === await this.#hasBaseDemoUser()) {
        console.log("No base demo user. Creating new one...")
      }
      await this.#doMaintenance();
      return true;
    } catch (error) {
      this.#status.error(error.message);
      return false;
    }
  }

  /**
   * Method used to stop database operations and disconnect
   */
  async stop() {
    mongoose.disconnect();
  }

  /**
   * Method used to get current web database component working status
   * @returns web database component status
   */
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
    return { types: [ComponentType.INIT], initWait: true };
  }

  /**
   * Method used to receive running history status of web database
   * @returns array of objects containing web database running history status
   */
  getHistory() {
    return this.#status.getHistory();
  }

  async #hasBaseDemoUser() {
    return await ScrapUser.getDatabaseModel().findOne({ email: "base@demo.com" }) != null;
  }

  /**
   * Method used to perform database maintenance operations after successfull connect
   */
  async #doMaintenance() {
    const usersCleaned = await this.#cleanDemoUsers();
    const configsCleaned = await this.#cleanUnusedConfigs();
    this.#status.info(`Maintenance summary: ${configsCleaned} configs, ${usersCleaned} demos`);
  }

  /**
   * Method used to cleanup all unused configs (which users do not exist anymore)
   * @returns number of unused scraper configurations removed
   */
  async #cleanUnusedConfigs() {
    const usersCount = await ScrapUser.getDatabaseModel().countDocuments();
    const configsCount = await ScrapConfig.getDatabaseModel().countDocuments();
    const toDelete = configsCount - usersCount;
    if (toDelete < 0) {
      throw new Error("Invalid state! There is an user without a config...");
    }
    if (toDelete > 0) {
      const users = await ScrapUser.getDatabaseModel().find();
      const usersIds = users.map((user) => user._id);
      const result = await ScrapConfig.getDatabaseModel().deleteMany({ user: { $not: { $in: usersIds } } });
      if (result.deletedCount != toDelete) {
        throw new Error("Invalid state! Inconsistent number of deleted configs...");
      }
    }
    return toDelete;
  }

  /**
   * Method used to cleanup all demo users (which are just temporary)
   * @returns number of demo session users removed
   */
  async #cleanDemoUsers() {
    const result = await ScrapUser.getDatabaseModel().deleteMany({ hostUser: { $ne: null } });
    return result.deletedCount;
  }
}

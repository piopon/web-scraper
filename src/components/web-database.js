import { StatusLogger } from "./status-logger.js";

import mongoose from "mongoose";

export class WebDatabase {
  static #COMPONENT_NAME = "web-database";

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
        dbName: this.#dbConfig.name,
        user: this.#dbConfig.user,
        pass: this.#dbConfig.password,
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
}

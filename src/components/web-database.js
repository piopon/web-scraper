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
    const connectOptions = {
      dbName: this.#dbConfig.name,
      user: this.#dbConfig.user,
      pass: this.#dbConfig.password,
      family: 4,
    };
    mongoose
      .connect(`mongodb://${this.#dbConfig.url}:${this.#dbConfig.port}`, connectOptions)
      .then(() => this.#status.info("Connected to database"))
      .catch((err) => this.#status.error(err));
  }

  /**
   * Method used to stop database operations and disconnect
   */
  async stop() {
    mongoose.disconnect();
  }
}

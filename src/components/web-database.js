import mongoose from "mongoose";

export class WebDatabase {
  static #COMPONENT_NAME = "web-db";

  #status = undefined;
  #dbConfig = undefined;

  constructor(config) {
    this.#dbConfig = config.databaseConfig;
    this.#status = new StatusLogger(WebDatabase.#COMPONENT_NAME, config.minLogLevel);
    this.#status.info("Created");
  }

  async start() {
    mongoose.connect(`mongodb://${this.#dbConfig.url}:${this.#dbConfig.port}/${this.#dbConfig.name}`);
  }

  async stop() {
    mongoose.disconnect();
  }
}

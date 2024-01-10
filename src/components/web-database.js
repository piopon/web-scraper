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
    const connectOptions = {
      dbName: this.#dbConfig.name,
      user: this.#dbConfig.user,
      pass: this.#dbConfig.password,
    };
    mongoose.connect(`mongodb://${this.#dbConfig.url}:${this.#dbConfig.port}`, connectOptions);
  }

  async stop() {
    mongoose.disconnect();
  }
}

export class WebDatabase {
  static #COMPONENT_NAME = "web-db";

  #status = undefined;

  constructor(config) {
    this.#status = new StatusLogger(WebDatabase.#COMPONENT_NAME, config.minLogLevel);
    this.#status.info("Created");
  }
}

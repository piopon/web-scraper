import { StatusLogger } from "./status-logger.js";

export class WebComponents {
  static #LOGGER_NAME = "web-components";

  #status = undefined;
  #components = [];

  /**
   * Creates a new web components with specified configuration
   */
  constructor(config) {
    this.#status = new StatusLogger(WebComponents.#LOGGER_NAME, config.minLogLevel);
    this.#status.info("Created");
  }

  addComponent(component) {
    this.#components.push(component);
  }

  /**
   * Method used to filter all components and return the one with desired type
   * @param {Object} type The type of components that we want to receive (or undefined for all components)
   * @returns array of components of specified type
   */
  getComponents(type = undefined) {
    if (undefined === type) {
      return this.#components;
    }
    return this.#components.filter((component) => {
      return -1 !== component.master.getInfo().types.findIndex((currType) => currType.equals(type));
    });
  }
}

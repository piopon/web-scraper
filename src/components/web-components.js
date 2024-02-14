import { ComponentType } from "../../config/app-types.js";
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

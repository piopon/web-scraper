import { ComponentType } from "../../config/app-types.js";
import { StatusLogger } from "./status-logger.js";

export class WebComponents {
  static #LOGGER_NAME = "web-components";

  #status = undefined;
  #components = [];

  /**
   * Creates a new web components with specified configuration
   * @param {Object} config The object containing components configuration
   */
  constructor(config) {
    this.#status = new StatusLogger(WebComponents.#LOGGER_NAME, config.minLogLevel);
    this.#status.info("Created");
  }

  /**
   * Method used to add a component to start after running web server
   * @param {Object} component The component to start after running web server
   */
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
   * @returns array of components of specified type (or all components if type is undefined)
   */
  getComponents(type = undefined) {
    if (undefined === type) {
      return this.#components;
    }
    return this.#components.filter((component) => {
      return -1 !== component.master.getInfo().types.findIndex((currType) => currType.equals(type));
    });
  }

  /**
   * Method used to initialize and start server-related components
   * @param {Object} type The type of components that we want to run
   * @returns true if all components are invoked, false if at least one has an error
   */
  async runComponents(type) {
    const components = this.getComponents(type);
    for (const component of components) {
      // if we don't wait for component initialization then start it and go to the next one
      if (!component.master.getInfo().initWait) {
        component.master.start().then(async (initialized) => {
          // if component is initialized and has slave then run after initialization action
          if (initialized && component.slave != null) {
            component.slave.getMaster().actions.afterInit();
          }
        });
        continue;
      }
      // we must wait for component initialization so we wait for the result and check it
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

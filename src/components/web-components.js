export class WebComponents {
  #components = [];

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

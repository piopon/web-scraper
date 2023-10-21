export class ControllersMediator {
  #registeredClasses = [];

  /**
   * Method used to registed specified class to mediator
   * @param {Object} classInstance The class which should be registered
   */
  register(classInstance) {
    if (this.#checkInterface(classInstance)) {
      this.#registeredClasses.push(classInstance);
      classInstance.handleEvent("subscribed", this);
    } else {
      console.error(`Cannot register ${classInstance.constructor.name}`);
    }
  }

  /**
   * The method used to notify all registered classes (except sender) that new event was transmitted
   * @param {Object} sender The sender of the event
   * @param {String} eventType The event type which should be propagated to all regsitered classes
   * @param {Object} eventObject The event object sent with event
   */
  notify(sender, eventType, eventObject) {
    for (let i = 0; i < this.#registeredClasses.length; i++) {
      if (this.#registeredClasses[i] !== sender) {
        this.#registeredClasses[i].handleEvent(eventType, eventObject);
      }
    }
  }

  /**
   * The method used to check if specified obejct fullfills mediator needed interface
   * @param {Object} classInstance The object which should be verified
   * @returns true if specified object has proper interface, false otherwise
   */
  #checkInterface(classInstance) {
    return "emitEvent" in classInstance && "handleEvent" in classInstance;
  }
}

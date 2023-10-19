export class ControllersMediator {
  #registeredClasses = [];

  register(classInstance) {
    if (this.#checkInterface(classInstance)) {
      this.#registeredClasses.push(classInstance);
      classInstance.handleEvent("subscribed", this);
    } else {
      console.error(`Cannot register ${classInstance.constructor.name}`);
    }
  }

  notify(sender, eventType, eventObject) {
    for (let i = 0; i < this.#registeredClasses.length; i++) {
      if (this.#registeredClasses[i] !== sender) {
        this.#registeredClasses[i].handleEvent(eventType, eventObject);
      }
    }
  }

  #checkInterface(classInstance) {
    return "emitEvent" in classInstance && "handleEvent" in classInstance;
  }
}

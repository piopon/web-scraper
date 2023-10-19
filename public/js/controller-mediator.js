export class ControllersMediator {
  constructor() {
    this.classes = [];
  }

  register(classInstance) {
    if (this.#checkInterface(classInstance)) {
      this.classes.push(classInstance);
      classInstance.handleEvent("subscribed", this);
    } else {
      console.error(`Cannot register ${classInstance.constructor.name}`);
    }
  }

  notify(sender, eventType, eventObject) {
    for (let i = 0; i < this.classes.length; i++) {
      if (this.classes[i] !== sender) {
        this.classes[i].handleEvent(eventType, eventObject);
      }
    }
  }

  #checkInterface(classInstance) {
    return "emitEvent" in classInstance && "handleEvent" in classInstance;
  }
}

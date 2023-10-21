export class ComponentsController {
  #mediator = undefined;

  /**
   * Creates new components controller
   */
  constructor() {
    this.#bindListeners();
  }

  /**
   * Method used to emit event from controller to mediator
   * @param {String} eventType The type of event which we want to transmit
   * @param {Object} eventObject The object which we want to transmit
   */
  emitEvent(eventType, eventObject) {
    if (undefined === this.#mediator) {
      console.error(`Cannot emit event - mediator is undefined`);
    }
    this.#mediator.notify(this, eventType, eventObject);
  }

  /**
   * Method used to handle event received from mediator
   * @param {String} eventType The type of received event
   * @param {Object} eventObject The received object
   */
  handleEvent(eventType, eventObject) {
    if ("subscribed" === eventType) {
      this.#mediator = eventObject;
    } else if ("observers-reloaded" === eventType) {
      // bind listeners to currently existing component cards
      this.#bindListeners();
    }
    return;
  }

  /**
   * Method used to update component cards expand/collapse effect
   * @param {Element} activeCard The card which should be expanded (other should be collapsed)
   */
  #updateComponentCards(activeCard) {
    const componentCards = activeCard.parentNode.querySelectorAll(".component-card");
    componentCards.forEach((card) => {
      if (card === activeCard) {
        card.setAttribute("active", "");
      } else {
        card.removeAttribute("active");
      }
    });
  };

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: component cards expand/collapse effects
   */
  #bindListeners() {
    const componentCards = document.querySelectorAll(".component-card");
    componentCards.forEach((card) => {
      card.addEventListener("click", () => {
        if (!card.hasAttribute("active")) {
          this.#updateComponentCards(card);
        }
      });
    });
  };
};

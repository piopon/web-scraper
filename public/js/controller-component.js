export class ComponentsController {
  #mediator = undefined;

  /**
   * Creates new components controller
   */
  constructor() {
    this.#bindListeners();
  }

  emitEvent(eventType, eventObject) {
    if (undefined === this.#mediator) {
      console.error(`Cannot emit event - mediator is undefined`);
    }
    this.#mediator.notify(this, eventType, eventObject);
  }

  handleEvent(eventType, eventObject) {
    if ("subscribed" === eventType) {
      this.#mediator = eventObject;
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

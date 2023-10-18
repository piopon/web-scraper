export class ComponentsController {
  /**
   * Creates new components controller
   */
  constructor() {
    this.#bindListeners();
  }

  /**
   * Method used to update component cards expand/collapse effect
   * @param {Element} activeCard The card which should be expanded (other should be collapsed)
   */
  #updateObserverCards(activeCard) {
    const observerCards = activeCard.parentNode.querySelectorAll(".component-card");
    observerCards.forEach((card) => {
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
          this.#updateObserverCards(card);
        }
      });
    });
  };
};

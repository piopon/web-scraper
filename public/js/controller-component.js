export class ComponentsController {
  /**
   * Creates new observers controller
   */
  constructor() {
    this.#bindListeners();
  }

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

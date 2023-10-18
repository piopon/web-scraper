export const ComponentsController = function () {
  const componentCards = document.querySelectorAll(".component-card");

  const bindListeners = function () {
    componentCards.forEach((card) => {
      card.addEventListener("click", () => {
        if (!card.hasAttribute("active")) {
          updateObserverCards(card);
        }
      });
    });

    const updateObserverCards = function (activeCard) {
      const observerCards = activeCard.parentNode.querySelectorAll(".component-card");
      observerCards.forEach((card) => {
        if (card === activeCard) {
          card.setAttribute("active", "");
        } else {
          card.removeAttribute("active");
        }
      });
    };
  };

  return { initialize: bindListeners };
};

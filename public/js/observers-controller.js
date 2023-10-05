import { ObserversService } from "./observers-service.js";

export const ObserversController = function () {
  const observerButtons = document.querySelectorAll("div.modal-button");
  const modalAcceptButtons = document.querySelectorAll("div.modal-close-btn.accept");
  const modalCancelButtons = document.querySelectorAll("div.modal-close-btn.cancel");

  /**
   * Method used to handle new observer addition
   * @param {String} group The observer parent group name
   */
  const addObserver = function (group) {
    ObserversService.addObserver(group)
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  };

  /**
   * Method used to handle specified observer update
   * @param {String} path The path identifier of the observer to update
   */
  const updateObserver = function (path) {
    ObserversService.updateObserver(path)
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  };

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: observer buttons and modal dialog accept and cancel buttons clicks
   */
  const bindListeners = function () {
    observerButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const observerDialog = this.parentNode.querySelector("div.modal-dialog");
        observerDialog.classList.remove("hidden");
        observerDialog.classList.add("init-reveal");
        event.stopPropagation();
      });
    });
    modalAcceptButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const selectedAction = this.dataset.action;
        if (selectedAction === "add") {
          addObserver(this.dataset.id)
        } else if (selectedAction === "update") {
          updateObserver(this.dataset.id)
        }
        this.parentNode.parentNode.parentNode.parentNode.classList.add("hidden");
        event.stopPropagation();
      });
    });
    modalCancelButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        this.parentNode.parentNode.parentNode.parentNode.classList.add("hidden");
        event.stopPropagation();
      });
    });
  };

  return { initialize: bindListeners };
};

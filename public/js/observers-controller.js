import { ObserversService } from "./observers-service.js";

export const ObserversController = function () {
  const observerButtons = document.querySelectorAll("div.modal-button");
  const modalAcceptButtons = document.querySelectorAll("div.modal-close-btn.accept");
  const modalCancelButtons = document.querySelectorAll("div.modal-close-btn.cancel");

  /**
   * Method used to reload observers for the specified parent group
   * @param {String} group The observers parent group name
   */
  const reloadObservers = function (group) {
    console.log("Reload observers");
  }

  /**
   * Method used to handle new observer addition
   * @param {String} group The observer parent group name
   */
  const addObserver = function (observer, group) {
    ObserversService.addObserver(group)
      .then((data) => {
        reloadObservers(group);
        observer.parentNode.parentNode.parentNode.parentNode.classList.add("hidden");
        console.log(data);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Method used to handle specified observer update
   * @param {String} path The path identifier of the observer to update
   */
  const updateObserver = function (observer, path) {
    ObserversService.updateObserver(path)
      .then((data) => {
        observer.parentNode.parentNode.parentNode.parentNode.classList.add("hidden");
        console.log(data)
      })
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
          addObserver(this, this.dataset.id)
        } else if (selectedAction === "update") {
          updateObserver(this, this.dataset.id)
        } else {
          console.error(`Unsupported accept button action: ${selectedAction}`)
        }
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

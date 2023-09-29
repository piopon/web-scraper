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
    console.log(`ADD OBSERVER TO GROUP: ${group}`);
  };

  /**
   * Method used to handle specified observer update
   * @param {String} path The path identifier of the observer to update
   */
  const updateObserver = function (path) {
    ObserversService.updateObserver(path);
    console.log(`UPDATE OBSERVER: ${path}`);
  };

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: observer buttons and modal dialog accept and cancel buttons clicks
   */
  const bindListeners = function () {
    observerButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const observerDialog = this.parentNode.querySelector("div.modal-dialog");
        observerDialog.classList.remove("out");
        observerDialog.classList.add("in");
        event.stopPropagation();
      });
    });
    modalAcceptButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        this.parentNode.parentNode.parentNode.parentNode.classList.add("out");
        event.stopPropagation();
      });
    });
    modalCancelButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        this.parentNode.parentNode.parentNode.parentNode.classList.add("out");
        event.stopPropagation();
      });
    });
  };

  return { initialize: bindListeners, add: addObserver, update: updateObserver };
};

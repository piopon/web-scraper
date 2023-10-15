import { ObserversService } from "./observers-service.js";
import { ObserversView } from "./observers-view.js";

export const ObserversController = function () {
  const observerButtons = document.querySelectorAll("div.modal-button");
  const modalAcceptButtons = document.querySelectorAll("div.modal-close-btn.accept");
  const modalCancelButtons = document.querySelectorAll("div.modal-close-btn.cancel");

  /**
   * Method used to reload observers for the specified parent group
   * @param {String} parentGroupId The observers parent group identifier
   */
  const reloadObservers = function (parentGroupId) {
    ObserversService.getObservers(parentGroupId)
      .then((data) => {
        const groupObservers = data[0].observers;
        ObserversView.getHtml(groupObservers);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Method used to handle new observer addition
   * @param {Element} observerDialog The observer modal dialog element
   * @param {String} parentGroup The observer parent group name
   */
  const addObserver = function (observerDialog, parentGroupId) {
    ObserversService.addObserver(parentGroupId)
      .then((data) => {
        reloadObservers(parentGroupId);
        observerDialog.classList.add("hidden");
        console.log(data);
      })
      .catch((error) => {
        observerDialog.classList.add("shake");
        setTimeout(() => observerDialog.classList.remove("shake"), 500);
        console.error(error);
      });
  };

  /**
   * Method used to handle specified observer update
   * @param {Element} observerDialog The observer modal dialog element
   * @param {String} editedObserverId The identifier of the observer to be edited
   */
  const updateObserver = function (observerDialog, editedObserverId) {
    ObserversService.updateObserver(editedObserverId)
      .then((data) => {
        observerDialog.classList.add("hidden");
        console.log(data);
      })
      .catch((error) => {
        observerDialog.classList.add("shake");
        setTimeout(() => observerDialog.classList.remove("shake"), 500);
        console.error(error);
      });
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
        const observerDialog = this.parentNode.parentNode.parentNode.parentNode;
        const selectedAction = this.dataset.action;
        if (selectedAction === "add") {
          addObserver(observerDialog, this.dataset.id);
        } else if (selectedAction === "update") {
          updateObserver(observerDialog, this.dataset.id);
        } else {
          console.error(`Unsupported accept button action: ${selectedAction}`);
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

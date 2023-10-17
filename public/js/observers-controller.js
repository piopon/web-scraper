import { ObserversService } from "./observers-service.js";
import { ObserversView } from "./observers-view.js";

export class ObserversController {
  /**
   * Creates new observers controller
   */
  constructor() {
    this.#bindListeners();
  }

  /**
   * Method used to reload observers for the specified parent group
   * @param {String} parentGroupId The observers parent group identifier
   */
  #reloadObservers(parentGroupId) {
    ObserversService.getObservers(parentGroupId)
      .then((data) => {
        const groupId = data[0].name;
        const groupObservers = data[0].observers;
        const expandedGroup = document.querySelector(".group-column.expanded");
        const expandedObservers = expandedGroup.querySelector(".observers-container");
        expandedObservers.innerHTML = ObserversView.getHtml(groupId, groupObservers);
        this.#bindListeners();
      })
      .catch((error) => console.error(error));
  };

  /**
   * Method used to handle new observer addition
   * @param {Element} observerDialog The observer modal dialog element
   * @param {String} parentGroup The observer parent group name
   */
  #addObserver(observerDialog, parentGroupId) {
    ObserversService.addObserver(parentGroupId)
      .then((data) => {
        this.#reloadObservers(parentGroupId);
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
  #updateObserver(observerDialog, editedObserverId) {
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
  #bindListeners() {
    const observerButtons = document.querySelectorAll("div.modal-button");
    observerButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget;
        const observerDialog = target.parentNode.querySelector("div.modal-dialog");
        observerDialog.classList.remove("hidden");
        observerDialog.classList.add("init-reveal");
        event.stopPropagation();
      });
    });
    const modalAcceptButtons = document.querySelectorAll("div.modal-close-btn.accept");
    modalAcceptButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget;
        const observerDialog = target.parentNode.parentNode.parentNode.parentNode;
        const selectedAction = target.dataset.action;
        if (selectedAction === "add") {
          this.#addObserver(observerDialog, target.dataset.id);
        } else if (selectedAction === "update") {
          this.#updateObserver(observerDialog, target.dataset.id);
        } else {
          console.error(`Unsupported accept button action: ${selectedAction}`);
        }
        event.stopPropagation();
      });
    });
    const modalCancelButtons = document.querySelectorAll("div.modal-close-btn.cancel");
    modalCancelButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget;
        target.parentNode.parentNode.parentNode.parentNode.classList.add("hidden");
        event.stopPropagation();
      });
    });
  };
};

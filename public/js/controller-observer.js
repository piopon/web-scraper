import { ObserversService } from "./service-observer.js";
import { ObserversView } from "./observers-view.js";

export class ObserversController {
  #mediator = undefined;
  #expandedGroup = undefined;

  /**
   * Creates new observers controller
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
    } else if ("group-expanded" === eventType) {
      this.#expandedGroup = eventObject;
    }
    return;
  }

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
    const modalCloseButtons = document.querySelectorAll("div.modal-close-btn");
    modalCloseButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget;
        const observerDialog = target.parentNode.parentNode.parentNode.parentNode;
        const selectedAction = target.dataset.action;
        if (selectedAction === "add") {
          this.#addObserver(observerDialog, target.dataset.id);
        } else if (selectedAction === "update") {
          this.#updateObserver(observerDialog, target.dataset.id);
        } else if (selectedAction === "delete") {
          this.#deleteObserver(observerDialog, target.dataset.id);
        } else if (selectedAction === "cancel") {
          observerDialog.classList.add("hidden");
        } else {
          console.error(`Unsupported accept button action: ${selectedAction}`);
        }
        event.stopPropagation();
      });
    });
  }

  /**
   * Method used to handle new observer add action
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
  }

  /**
   * Method used to handle specified observer update action
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
  }

  /**
   * Method used to handle specified observer delete action
   * @param {Element} observerDialog The observer modal dialog element
   * @param {String} deletedObserverId The identifier of the observer to be removed
   */
  #deleteObserver(observerDialog, deletedObserverId) {
    ObserversService.deleteObserver(deletedObserverId)
      .then((data) => {
        this.#reloadObservers(this.#expandedGroup);
        observerDialog.classList.add("hidden");
        console.log(data);
      })
      .catch((error) => {
        observerDialog.classList.add("shake");
        setTimeout(() => observerDialog.classList.remove("shake"), 500);
        console.error(error);
      });
  }

  /**
   * Method used to reload observers for the specified parent group
   * @param {String} parentGroupId The observers parent group identifier
   */
  #reloadObservers(parentGroupId) {
    if (parentGroupId === undefined || parentGroupId === "+") {
      console.error(`Cannot reload observers for ${parentGroupId} parent.`);
      return;
    }
    ObserversService.getObservers(parentGroupId)
      .then((data) => {
        const groupId = data[0].name;
        const groupObservers = data[0].observers;
        const expandedGroup = document.querySelector(".group-column.expanded");
        const expandedObservers = expandedGroup.querySelector(".observers-container");
        expandedObservers.innerHTML = ObserversView.getHtml(groupId, groupObservers);
        this.#bindListeners();
        // notify other controllers that observers were reloaded
        this.emitEvent("observers-reloaded", groupId);
      })
      .catch((error) => console.error(error));
  }

  /**
   * Method used to hide the close button parent observer modal dialog
   * @param {Element} observerCloseButton The close button for which parent dialog should be closed
   */
  #hideDialog(observerCloseButton) {
    const observerDialog = observerCloseButton.parentNode.parentNode.parentNode.parentNode;
    observerDialog.classList.add("hidden");
  }
}

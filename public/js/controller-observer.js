import { CommonController } from "./controller-common.js";
import { ObserversService } from "./service-observer.js";
import { ObserversView } from "./view-observer.js";

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
      CommonController.showToastWarning(`Cannot emit event - mediator is undefined`);
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
    } else if ("groups-reloaded" === eventType) {
      this.#bindListeners();
      // since groups were reloaded then by definition observers were also reloaded
      this.emitEvent("observers-reloaded", undefined);
    }
    return;
  }

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: observer buttons and modal dialog accept and cancel buttons clicks
   * @param {String} parentGroupId The observer parent group name for which we want to bind listeners.
   *                               If not used then this will affect ALL observer buttons/dialogs.
   */
  #bindListeners(parentGroupId = undefined) {
    const parentGroupSelector = parentGroupId ? ".group-column.expanded " : "";
    const observerButtons = document.querySelectorAll(`${parentGroupSelector}div.modal-button`);
    observerButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget;
        const observerDialog = target.parentNode.querySelector("div.modal-dialog");
        observerDialog.classList.remove("hidden");
        observerDialog.classList.add("init-reveal");
        event.stopPropagation();
      });
    });
    const modalCloseButtons = document.querySelectorAll(`${parentGroupSelector}div.modal-close-btn`);
    modalCloseButtons.forEach((closeButton) => {
      closeButton.addEventListener("click", (clickEvent) => {
        const target = clickEvent.currentTarget;
        const selectedAction = target.dataset.action;
        if ("add" === selectedAction) {
          this.#addObserver(closeButton, target.dataset.id);
        } else if ("update" === selectedAction) {
          this.#updateObserver(closeButton, target.dataset.id);
        } else if ("delete" === selectedAction) {
          const confirmDialog = document.querySelector("dialog.delete-observer-dialog");
          confirmDialog.addEventListener("close", (closeEvent) => {
            if ("yes" === confirmDialog.returnValue) {
              this.#deleteObserver(closeButton, target.dataset.id);
            }
            closeEvent.stopPropagation();
          }, { once: true });
          confirmDialog.querySelector("label").innerText = `delete observer: ${target.dataset.id}?`
          confirmDialog.showModal();
        } else if ("cancel" === selectedAction) {
          this.#hideDialog(closeButton);
        } else {
          CommonController.showToastError(`Unsupported accept button action: ${selectedAction}`);
        }
        clickEvent.stopPropagation();
      });
    });
  }

  /**
   * Method used to handle new observer add action
   * @param {Element} closeButton The close button used to call this method
   * @param {String} parentGroup The observer parent group name
   */
  #addObserver(closeButton, parentGroupId) {
    ObserversService.addObserver(parentGroupId)
      .then((data) => {
        this.#reloadObservers(parentGroupId);
        this.#hideDialog(closeButton);
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        closeButton.classList.add("shake");
        setTimeout(() => closeButton.classList.remove("shake"), 500);
        CommonController.showToastError(error);
      });
  }

  /**
   * Method used to handle specified observer update action
   * @param {Element} closeButton The close button used to call this method
   * @param {String} editedObserverId The identifier of the observer to be edited
   */
  #updateObserver(closeButton, editedObserverId) {
    ObserversService.updateObserver(editedObserverId)
      .then((data) => {
        this.#hideDialog(closeButton);
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        closeButton.classList.add("shake");
        setTimeout(() => closeButton.classList.remove("shake"), 500);
        CommonController.showToastError(error);
      });
  }

  /**
   * Method used to handle specified observer delete action
   * @param {Element} closeButton The close button used to call this method
   * @param {String} deletedObserverId The identifier of the observer to be removed
   */
  #deleteObserver(closeButton, deletedObserverId) {
    ObserversService.deleteObserver(deletedObserverId)
      .then((data) => {
        this.#reloadObservers(this.#expandedGroup);
        this.#hideDialog(closeButton);
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        closeButton.classList.add("shake");
        setTimeout(() => closeButton.classList.remove("shake"), 500);
        CommonController.showToastError(error);
      });
  }

  /**
   * Method used to reload observers for the specified parent group
   * @param {String} parentGroupId The observers parent group identifier
   */
  #reloadObservers(parentGroupId) {
    if (undefined === parentGroupId || "+" === parentGroupId) {
      CommonController.showToastWarning(`Cannot reload observers for ${parentGroupId} parent.`);
      return;
    }
    ObserversService.getObservers(parentGroupId)
      .then((data) => {
        let html = "";
        data[0].observers.forEach((observer) => (html += ObserversView.toHtml(observer)));
        document.querySelector(".group-column.expanded")
                .querySelector(".observers-container")
                .innerHTML = html + ObserversView.toHtml(data[0].name);
        this.#bindListeners(parentGroupId);
        // notify other controllers that observers were reloaded
        this.emitEvent("observers-reloaded", parentGroupId);
      })
      .catch((error) => CommonController.showToastError(error));
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

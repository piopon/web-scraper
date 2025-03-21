import { CommonController } from "./controller-common.js";
import { ObserversService } from "./service-observer.js";
import { ObserversView } from "./view-observer.js";

export class ObserversController {
  #mediator = undefined;
  #expandedGroup = undefined;
  #openedObserver = undefined;

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
    } else if ("group-restored" === eventType) {
      this.#bindListeners(eventObject);
      // since the group was restored then by definition observers were also restored
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
    const parentElement = parentGroupId ? CommonController.getGroupColumnWithName(parentGroupId) : document;
    const observerButtons = parentElement.querySelectorAll("div.modal-button");
    observerButtons.forEach((button) => this.#bindOpenDialogListener(button));
    const modalCloseButtons = parentElement.querySelectorAll("div.modal-close-btn");
    modalCloseButtons.forEach((button) => this.#bindCloseDialogListener(button));
  }

  /**
   * Method used to add open dialog action listeners to observers buttons
   * @param {Element} openButton The observer button which should be able to open observer dialog
   */
  #bindOpenDialogListener(openButton) {
    openButton.addEventListener("click", (event) => {
      const target = event.currentTarget;
      const observerDialog = target.parentNode.querySelector("div.modal-dialog");
      observerDialog.classList.remove("hidden");
      observerDialog.classList.add("init-reveal");
      event.stopPropagation();
      this.#storeObserverData(target);
      this.#initializeDialog(observerDialog);
    });
  }

  /**
   * Method used to add close dialog action listeners to observer dialog buttons
   * @param {Element} closeButton The dialog button which should be able to close observer dialog
   */
  #bindCloseDialogListener(closeButton) {
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
      } else if ("view" === selectedAction) {
        const currObserver = document.querySelector("div.modal-dialog.init-reveal");
        const currPath = currObserver.querySelector("input.observer-path").value;
        window.open(this.#expandedGroup.domain + "/" + currPath, '_blank').focus();
      } else if ("cancel" === selectedAction) {
        this.#hideDialog(closeButton);
        this.#restoreObserverData(target);
      } else {
        CommonController.showToastError(`Unsupported accept button action: ${selectedAction}`);
      }
      clickEvent.stopPropagation();
    });
  }

  /**
   * Method used intialize observer dialog: init buttons state and listeners binding
   * @param {Element} dialog The dialog to be initialized
   */
  #initializeDialog(dialog) {
    const observerPath = dialog.querySelector("input.observer-path");
    const observerViewBtn = dialog.querySelector("div.modal-close-btn.view");
    CommonController.enableElement(observerViewBtn, observerPath.value.length > 0);
    observerPath.addEventListener("input", () => {
      CommonController.enableElement(observerViewBtn, observerPath.value.length > 0);
    });
  }

  /**
   * Method used to handle new observer add action
   * @param {Element} closeButton The close button used to call this method
   * @param {String} parentGroup The observer parent group name
   */
  #addObserver(closeButton, parentGroupId) {
    CommonController.updateElementLoadingState(closeButton, true);
    ObserversService.addObserver(parentGroupId)
      .then((data) => {
        CommonController.updateElementLoadingState(closeButton, false);
        this.#reloadObservers(parentGroupId);
        this.#hideDialog(closeButton);
        this.#clearObserverData();
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        CommonController.updateElementLoadingState(closeButton, false);
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
    CommonController.updateElementLoadingState(closeButton, true);
    ObserversService.updateObserver(editedObserverId)
      .then((data) => {
        CommonController.updateElementLoadingState(closeButton, false);
        this.#hideDialog(closeButton);
        this.#clearObserverData();
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        CommonController.updateElementLoadingState(closeButton, false);
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
    CommonController.updateElementLoadingState(closeButton, true);
    ObserversService.deleteObserver(deletedObserverId)
      .then((data) => {
        CommonController.updateElementLoadingState(closeButton, false);
        this.#reloadObservers(this.#expandedGroup.name);
        this.#hideDialog(closeButton);
        this.#clearObserverData();
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        CommonController.updateElementLoadingState(closeButton, false);
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
    CommonController.updateObserverContainerState(parentGroupId, false);
    ObserversService.getObservers(parentGroupId)
      .then((data) => {
        let html = "";
        data[0].observers.forEach((observer) => (html += ObserversView.toHtml(observer)));
        document.querySelector(".group-column.expanded")
                .querySelector(".observers-container")
                .innerHTML = html + ObserversView.toHtml(data[0].name);
        CommonController.updateObserverContainerState(parentGroupId, true);
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

  /**
   * Method used to save specified observer's data
   * @param {Object} observerTarget The observer which data we want to store
   */
  #storeObserverData(observerTarget) {
    this.#openedObserver = ObserversView.fromHtml(observerTarget.parentNode);
    // if stored observer does not have a name then it's a new one = we have to remember the parent ID
    if (!this.#openedObserver.name) {
      this.#openedObserver = this.#expandedGroup.name;
    }
  }

  /**
   * Method used to clean saved observer data
   */
  #clearObserverData() {
    this.#openedObserver = undefined;
  }

  /**
   * Method used to restore values saved earlier for specified observer target
   * @param {Object} observerTarget The observer which values we want to restore
   */
  #restoreObserverData(observerTarget) {
    // update current target values with the restored ones
    const parentContainer = observerTarget.closest("div.observers-container");
    const childIndex = Array.from(parentContainer.children)
      .map((element) => element.querySelector("div.modal-button").innerText)
      .findIndex((name) => name === this.#openedObserver.name);
    const restoredElement = CommonController.htmlToElement(ObserversView.toHtml(this.#openedObserver));
    const previousElement = childIndex < 0 ? parentContainer.lastElementChild : parentContainer.children[childIndex];
    parentContainer.replaceChild(restoredElement, previousElement);
    this.#clearObserverData();
    // bind open and close listeners to the newly updated/restored element
    this.#bindOpenDialogListener(restoredElement.querySelector(`div.modal-button`));
    restoredElement.querySelectorAll(`div.modal-close-btn`).forEach((btn) => this.#bindCloseDialogListener(btn));
    // notify other controller(s) that observer(s) were changed
    this.emitEvent("observers-reloaded", undefined);
  }
}

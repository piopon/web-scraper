import { CommonController } from "./controller-common.js";
import { ComponentService } from "./service-component.js";

export class ComponentsController {
  static #EMPTY_IMAGE_ID = "Select image";

  #mediator = undefined;

  /**
   * Creates new components controller
   */
  constructor() {
    this.#initController();
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
    } else if ("observers-reloaded" === eventType) {
      // re-initialize controller with current component cards
      this.#initController();
    }
    return;
  }

  /**
   * Method used to (re)initialize controller
   */
  #initController() {
    this.#initStyle();
    this.#bindListeners();
  }

  /**
   * Method used to set style for all component cards
   */
  #initStyle() {
    const componentToggles = document.querySelectorAll("input.check-auto-manual");
    componentToggles.forEach((toggle) => {
      const cardFields = toggle.parentNode.parentNode.querySelector("div.component-fields");
      const manualId = cardFields.querySelector("input[name='auxiliary']").value;
      // if manual identifier field is empty or contains "Select image" then it's not used = auto mode selected
      const cardMode = "" === manualId || ComponentsController.#EMPTY_IMAGE_ID === manualId ? "auto" : "manual";
      toggle.checked = "manual" === cardMode;
      this.#updateCardEnableState(cardMode, cardFields);
    });
    const uploadFileButtons = document.querySelectorAll("input.component-image-auxiliary-submit");
    uploadFileButtons.forEach((button) => {
      const imageButton = button.previousElementSibling;
      button.disabled = imageButton.value === ComponentsController.#EMPTY_IMAGE_ID;
    });
  }

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: component cards expand/collapse effects
   */
  #bindListeners() {
    const componentCards = document.querySelectorAll(".component-card");
    componentCards.forEach((card) => {
      card.addEventListener("click", () => {
        if (!card.hasAttribute("active")) {
          this.#updateComponentCards(card);
        }
      });
    });
    const componentToggles = document.querySelectorAll("input.check-auto-manual");
    componentToggles.forEach((toggle) => {
      toggle.addEventListener("change", () => {
        const cardMode = toggle.checked ? "manual" : "auto";
        const cardFields = toggle.parentNode.parentNode.querySelector("div.component-fields");
        this.#updateCardEnableState(cardMode, cardFields);
      });
    });
    const imageFileButtons = document.querySelectorAll("input.component-image-auxiliary-button");
    imageFileButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.target.previousElementSibling.click();
        event.stopPropagation();
      });
    });
    const imageFileSelectors = document.querySelectorAll("input.component-image-auxiliary-file");
    imageFileSelectors.forEach((selector) => {
      selector.addEventListener("change", (event) => {
        if (event.target.files[0]) {
          const fileButton = event.target.nextElementSibling;
          fileButton.value = event.target.files[0].name;
          event.target.nextElementSibling.nextElementSibling.disabled = false;
        }
      });
    });
    const uploadFileButtons = document.querySelectorAll("input.component-image-auxiliary-submit");
    uploadFileButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const fileInput = event.target.previousElementSibling.previousElementSibling;
        ComponentService.addImage(fileInput)
          .then((data) => {
            CommonController.showToastSuccess(data);
          })
          .catch((error) => {
            CommonController.showToastError(error);
          });
      });
    });
  }

  /**
   * Method used to update component cards expand/collapse effect
   * @param {Element} activeCard The card which should be expanded (other should be collapsed)
   */
  #updateComponentCards(activeCard) {
    const componentCards = activeCard.parentNode.querySelectorAll(".component-card");
    componentCards.forEach((card) => {
      if (card === activeCard) {
        card.setAttribute("active", "");
      } else {
        card.removeAttribute("active");
      }
    });
  }

  /**
   * Method used to update the enable state of toggle's parent card components
   * @param {String} toggleMode The current toggle mode (auto/manual) for which we want to update UI state
   * @param {Element} cardFields The card fields parent HTML element container
   */
  #updateCardEnableState(toggleMode, cardFields) {
    const currSelector = cardFields.querySelectorAll("input[name='selector']");
    const currAttribute = cardFields.querySelectorAll("input[name='attribute']");
    const currAuxiliary = cardFields.querySelectorAll("input[name='auxiliary']");
    if (currSelector == undefined || 0 === currSelector.length) {
      CommonController.showToastError(`Cannot update card selector enable state`);
      return;
    }
    if (currAttribute == undefined || 0 === currAttribute.length) {
      CommonController.showToastError(`Cannot update card attribute enable state`);
      return;
    }
    if (currAuxiliary == undefined || 0 === currAuxiliary.length) {
      CommonController.showToastError(`Cannot update card auxiliary enable state`);
      return;
    }
    this.#updateFieldEnableState(currSelector, "auto" === toggleMode);
    this.#updateFieldEnableState(currAttribute, "auto" === toggleMode);
    this.#updateFieldEnableState(currAuxiliary, "manual" === toggleMode);
  }

  /**
   * The method used to update the enable state (and by definition the value) of a specific field
   * @param {Element} fieldArray The fields array which enable states should be updated
   * @param {Boolean} enabled The new enable state of specified field
   */
  #updateFieldEnableState(fieldArray, enabled) {
    fieldArray.forEach(field => field.disabled = !enabled);
  }
}

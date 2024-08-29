import { CommonController } from "./controller-common.js";

export class ComponentsController {
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
      const cardMode = "" === manualId || "Select image" === manualId ? "auto" : "manual";
      toggle.checked = "manual" === cardMode;
      this.#updateCardEnableState(cardMode, cardFields);
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
        const fileSelector = event.target.previousElementSibling;
        fileSelector.click();
      });
    });
    const imageFileSelectors = document.querySelectorAll("input.component-image-auxiliary-file");
    imageFileSelectors.forEach((selector) => {
      selector.addEventListener("change", (event) => {
        if (event.target.files[0]) {
          const fileButton = document.querySelector('input.component-image-auxiliary-button');
          fileButton.value = event.target.files[0].name;
        }
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
   * @param {Element} field The field which enable state should be updated
   * @param {Boolean} enabled The new enable state of specified field
   */
  #updateFieldEnableState(field, enabled) {
    field.disabled = !enabled;
  }
}

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
    const currSelector = cardFields.querySelector("input[name='selector']");
    const currAttribute = cardFields.querySelector("input[name='attribute']");
    const currAuxiliary = cardFields.querySelector("input[name='auxiliary']");
    if (currSelector == undefined || currAttribute == undefined || currAuxiliary == undefined) {
      CommonController.showToastError(`Cannot update card enable state`);
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
    if (enabled) {
      field.disabled = false;
    } else {
      // we need to treat image auxiliary field individually since it's a button with label when value is empty
      field.value = field.classList.contains("component-image-auxiliary") ? "Select image" : "";
      field.disabled = true;
    }
  }
}

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
      try {
        const cardFields = toggle.parentNode.parentNode.querySelector("div.component-fields");
        const cardMode = this.#getComponentCardMode(cardFields);
        toggle.checked = "manual" === cardMode;
        this.#updateCardEnableState(cardMode, cardFields);
      } catch (error) {
        CommonController.showToastError(error.message);
      }
    });
    const uploadFileButtons = document.querySelectorAll("input.component-image-auxiliary-submit");
    uploadFileButtons.forEach((button) => {
      const noImageSaved = button.previousElementSibling.value === ComponentsController.#EMPTY_IMAGE_ID;
      const noImageSelected = button.previousElementSibling.previousElementSibling.files.length === 0;
      button.disabled = noImageSaved || noImageSelected;
    });
  }

  /**
   * Method used to receive the current card mode base on its fields state
   * @param {Element} cardFields The HTML element with cards field container
   * @returns "auto" or "manual" string based on the specified card current fields values
   */
  #getComponentCardMode(cardFields) {
    const auxField = cardFields.querySelector("input[name='auxiliary']");
    if (auxField != undefined) {
      // this card has field with "auxiliary" name hence it must be a title card
      return "" === auxField.value ? "auto" : "manual";
    }
    const imgSelectButton = cardFields.querySelector("input[name='auxiliary-select']");
    const imgUploadButton = cardFields.querySelector("input[name='auxiliary-upload']");
    if (imgSelectButton != undefined && imgUploadButton != undefined) {
      // this card has buttons with auxiliary names related to image hence it must be a image card
      return ComponentsController.#EMPTY_IMAGE_ID === imgSelectButton.value ? "auto" : "manual";
    }
    throw new Error("Cannot retrieve component card mode");
  }

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: component cards expand/collapse effects, component toggles and image selection events
   */
  #bindListeners() {
    document.querySelectorAll(".component-card").forEach((card) => {
      card.addEventListener("click", this.#cardChangeHandler.bind(this));
    });
    document.querySelectorAll("input.check-auto-manual").forEach((toggle) => {
      toggle.addEventListener("change", this.#toggleChangeHandler.bind(this));
    });
    document.querySelectorAll("input.component-image-auxiliary-file").forEach((selector) => {
      selector.addEventListener("change", this.#changeImageHandler);
    });
    document.querySelectorAll("input.component-image-auxiliary-button").forEach((button) => {
      button.addEventListener("click", this.#selectImageHandler);
    });
    document.querySelectorAll("input.component-image-auxiliary-submit").forEach((button) => {
      button.addEventListener("click", this.#uploadImageHandler);
    });
  }

  /**
   * Handler used to be called when the active component card has changed
   * @param {Event} event A listener event object
   */
  #cardChangeHandler(event) {
    const currentCard = event.currentTarget;
    if (!currentCard.hasAttribute("active")) {
      this.#updateComponentCards(currentCard);
    }
  }

  /**
   * Handler used to be called when the card auto/manual toggle component is changed
   * @param {Event} event A listener event object
   */
  #toggleChangeHandler(event) {
    try {
      const currentToggle = event.currentTarget;
      const cardMode = currentToggle.checked ? "manual" : "auto";
      const cardFields = currentToggle.parentNode.parentNode.querySelector("div.component-fields");
      this.#updateCardEnableState(cardMode, cardFields);
    } catch (error) {
      CommonController.showToastError(error.message);
    }
  }

  /**
   * Handler used to be called when user changes and accepts the image in the selector dialog
   * @param {Event} event A listener event object
   */
  #changeImageHandler(event) {
    if (event.target.files[0]) {
      const fileButton = event.target.nextElementSibling;
      fileButton.value = event.target.files[0].name;
      event.target.nextElementSibling.nextElementSibling.disabled = false;
    }
  }

  /**
   * Handler used to be called when image select button was clicked
   * @param {Event} event A listener event object
   */
  #selectImageHandler(event) {
    event.target.previousElementSibling.click();
    event.stopPropagation();
  }

  /**
   * Handler used to be called when the selected image should be uploaded to server
   * @param {Event} event A listener event object
   */
  #uploadImageHandler(event) {
    const fileInput = event.target.previousElementSibling.previousElementSibling;
    ComponentService.addImage(fileInput)
      .then((data) => {
        event.target.previousElementSibling.setAttribute("url", data.url);
        CommonController.showToastSuccess(data.message);
      })
      .catch((error) => {
        CommonController.showToastError(error);
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
    if (currSelector == undefined || 0 === currSelector.length) {
      throw new Error(`Cannot update card selector enable state`);
    }
    const currAttribute = cardFields.querySelectorAll("input[name='attribute']");
    if (currAttribute == undefined || 0 === currAttribute.length) {
      throw new Error(`Cannot update card attribute enable state`);
    }
    const autoEnabled = "auto" === toggleMode;
    const currAuxiliary = cardFields.querySelectorAll("input[name='auxiliary']");
    const currImgSelect = cardFields.querySelectorAll("input[name='auxiliary-select']");
    if (currAuxiliary != undefined && currAuxiliary.length >= 1) {
      this.#updateFieldEnableState(currAuxiliary, !autoEnabled);
    } else if (currImgSelect != undefined && currImgSelect.length >= 1) {
      this.#updateFieldEnableState(currImgSelect, !autoEnabled);
      currImgSelect.forEach((imgSelect) => {
        const uploadButton = imgSelect.nextElementSibling;
        const fileSelected = imgSelect.previousElementSibling.files.length > 0;
        const uploadEnable = !autoEnabled && fileSelected && imgSelect.value !== ComponentsController.#EMPTY_IMAGE_ID;
        this.#updateFieldEnableState([uploadButton], uploadEnable);
      });
    } else {
      throw new Error(`Cannot update card auxiliary enable state`);
    }
    this.#updateFieldEnableState(currSelector, autoEnabled);
    this.#updateFieldEnableState(currAttribute, autoEnabled);
  }

  /**
   * The method used to update the enable state (and by definition the value) of a specific field
   * @param {Element} fieldArray The fields array which enable states should be updated
   * @param {Boolean} enabled The new enable state of specified field
   */
  #updateFieldEnableState(fieldArray, enabled) {
    fieldArray.forEach((field) => (field.disabled = !enabled));
  }
}

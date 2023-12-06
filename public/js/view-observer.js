import { ComponentsView } from "./view-component.js";

export class ObserversView {
  /**
   * Creates an observer object from the provided HTML element
   * @param {Element} observerHtml The HTML content from which we want to create an observer object
   * @returns Object with observer data retrieved from input HTML element
   */
  static fromHtml(observerHtml) {
    return {
      name: observerHtml.querySelector("input.observer-name").value,
      path: observerHtml.querySelector("input.observer-path").value,
      target: observerHtml.querySelector("select.observer-target").value,
      history: observerHtml.querySelector("select.observer-history").value,
      container: observerHtml.querySelector("input.observer-container").value,
      title: ComponentsView.fromHtml(ComponentsView.COMPONENT_TITLE, observerHtml),
      image: ComponentsView.fromHtml(ComponentsView.COMPONENT_IMAGE, observerHtml),
      price: ComponentsView.fromHtml(ComponentsView.COMPONENT_PRICE, observerHtml),
    };
  }

  /**
   * Receive HTML code representing an existing observer (object input) or a new observer (string input)
   * @param {Object} observerData The observer object or a parent ID if a new observer HTML should be created
   * @return HTML code with observer content
   */
  static toHtml(observerData) {
    if (observerData === null) {
      return "Invalid observer! Cannot create HTML from a null parameter";
    }
    if ('object' === typeof(observerData) && !Array.isArray(observerData)) {
      // adding HTML for am existing observer of an existing group (created earlier)
      return ObserversView.#getExistingObserverHtml(observerData);
    } else if ('string' === typeof(observerData) || observerData instanceof String) {
      // adding HTML for a new observer of an existing group (created earlier)
      return ObserversView.#getNewObserverHtml(observerData, false);
    } else if (undefined === observerData) {
      // adding HTML for a new observer of a group during creation (add group column)
      return ObserversView.#getNewObserverHtml(observerData, true);
    } else {
      return "Invalid observer! Must be an observer object or ID string";
    }
  };

  /**
   * Method used to receive HTML code representing observer object
   * @param {Object} observer The observer object which HTML code we want to get
   * @returns HTML code with existing observer contents
   */
  static #getExistingObserverHtml(observer) {
    return `<div class="observer-content">
              ${ObserversView.#getObserverModalHtml(undefined, observer)}
              <div class="modal-button">${observer.name}</div>
            </div>`;
  }

  /**
   * Method used to receive HTML code representing new observer UI
   * @param {String} groupId The observer parent (group) identifier
   * @param {Boolean} disabled If the observer UI should be disabled (true) or enabled (false)
   * @returns HTML code with new observer UI contents
   */
  static #getNewObserverHtml(groupId, disabled) {
    return `<div class="observer-content">
              ${ObserversView.#getObserverModalHtml(groupId, undefined)}
              <div class="modal-button new-observer" ${disabled ? "disabled" : ""}>+</div>
            </div>`;
  }

  /**
   * Method used to receive HTML code for observer modal dialog
   * @param {String} groupId The group identifier as observer parent (used when adding new observer)
   * @param {Object} observer The observer which contents will be displayed in modal dialog
   * @returns HTML code with observer modal dialog
   */
  static #getObserverModalHtml(groupId, observer) {
    const titleComponent = observer !== undefined ? observer.title : undefined;
    const imageComponent = observer !== undefined ? observer.image : undefined;
    const priceComponent = observer !== undefined ? observer.price : undefined;
    return `<div class="modal-dialog hidden">
              <div class="modal-background">
                <div class="modal-content">
                  <div class="observer-root-data">
                    <h3 class="observer-data-title">base config</h3>
                    ${ObserversView.#getObserverRootDataRow1Html(observer)}
                    ${ObserversView.#getObserverRootDataRow2Html(observer)}
                  </div>
                  <div class="component-cards">
                    ${ComponentsView.toHtml(ComponentsView.COMPONENT_TITLE, titleComponent)}
                    ${ComponentsView.toHtml(ComponentsView.COMPONENT_IMAGE, imageComponent)}
                    ${ComponentsView.toHtml(ComponentsView.COMPONENT_PRICE, priceComponent)}
                  </div>
                  <div class="observer-buttons">
                    ${ObserversView.#getObserverModalButtonsHtml(groupId, observer)};
                  </div>
                </div>
              </div>
            </div>`;
  }

  /**
   * Method used to receive observer root data, first row contents
   * @param {Object} observer The observer which root data should be received
   * @returns HTML code with observer root data, first row contents
   */
  static #getObserverRootDataRow1Html(observer) {
    const name = observer !== undefined ? observer.name : "";
    const target = observer !== undefined ? observer.target : "";
    const history = observer !== undefined ? observer.history : "";
    const disabled = observer !== undefined ? "disabled" : "";
    return `<div class="observer-data-row1">
              <div class="widget fill">
                <label class="observer-label">name:</label>
                ${observer === undefined ? `<div class="id"></div>` : ""}
                <input type="text" class="observer-name" name="name" value="${name}" ${disabled}/>
              </div>
              <div class="widget">
                <label class="observer-label">target:</label>
                <select class="observer-target" name="target" required>
                  <option value="" disabled hidden ${target === "" ? "selected" : ""}>Select value</option>
                  <option value=load ${target === "load" ? "selected" : ""}>load</option>
                  <option value=domcontentloaded ${target === "domcontentloaded" ? "selected" : ""}>domcontentloaded</option>
                  <option value=networkidle0 ${target === "networkidle0" ? "selected" : ""}>networkidle0</option>
                  <option value=networkidle2 ${target === "networkidle2" ? "selected" : ""}>networkidle2</option>
                </select>
              </div>
              <div class="widget">
                <label class="observer-label">history:</label>
                <select class="observer-history" name="history" required>
                  <option value="" disabled hidden ${history === "" ? "selected" : ""}>Select value</option>
                  <option value=off ${history === "off" ? "selected" : ""}>off</option>
                  <option value=onChange ${history === "onChange" ? "selected" : ""}>onChange</option>
                  <option value=on ${history === "on" ? "selected" : ""}>on</option>
                </select>
              </div>
            </div>`;
  }

  /**
   * Method used to receive observer root data, second row contents
   * @param {Object} observer The observer which root data should be received
   * @returns HTML code with observer root data, second row contents
   */
  static #getObserverRootDataRow2Html(observer) {
    const path = observer !== undefined ? observer.path : "";
    const container = observer !== undefined ? observer.container : "";
    return `<div class="observer-data-row2">
              <div class="widget fill">
                <label class="observer-label">path:</label>
                <input type="text" class="observer-path" name="path" value="${path}" />
              </div>
              <div class="widget fill">
                <label class="observer-label">container:</label>
                <input type="text" class="observer-container" name="container" value="${container}" />
              </div>
            </div>`;
  }

  /**
   * Method used to receive observer modal dialog buttons HTML code
   * @param {String} groupId The observer parent group identifier
   * @param {Object} observer The observer for which we want to generate buttons code
   * @returns HTML code containing modal dialog buttons for specified observer
   */
  static #getObserverModalButtonsHtml(groupId, observer) {
    if (observer === undefined) {
      // no observer provided = we are adding a new one
      return `<div class="modal-close-btn accept" data-action="add" data-id="${groupId}">add</div>
              <div class="modal-close-btn cancel" data-action="cancel">cancel</div>`;
    }
    // provided is an edited one
    return `<div class="modal-close-btn accept" data-action="update" data-id="${observer.name}">update</div>
            <div class="modal-close-btn delete" data-action="delete" data-id="${observer.name}">delete</div>
            <div class="modal-close-btn cancel" data-action="cancel">cancel</div>`;
  }
}

export class ObserversView {
  /**
   * Method used to receive HTML code representing input observers array
   * @param {String} groupId The observers parent group identifier
   * @param {Array} observers The array of observers which HTML code we want to get
   * @return HTML code with all observers contents
   */
  static getHtml = function (groupId, observers) {
    let result = "";
    observers.forEach((observer) => {
      result += ObserversView.#getExistingObserverHtml(observer);
    });
    result += ObserversView.#getNewObserverHtml(groupId);
    return result;
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
   * @returns HTML code with new observer UI contents
   */
  static #getNewObserverHtml(groupId) {
    return `<div class="observer-content">
              ${ObserversView.#getObserverModalHtml(groupId, undefined)}
              <div class="modal-button new-observer">+</div>
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
                    ${ObserversView.#getObserverTitleComponentHtml(titleComponent)}
                    ${ObserversView.#getObserverImageComponentHtml(imageComponent)}
                    ${ObserversView.#getObserverPriceComponentHtml(priceComponent)}
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
    return `<div class="observer-data-row1">
              <div class="widget fill">
                <label class="observer-label">name:</label>
                ${observer === undefined ? `<div class="id"></div>` : ""}
                <input type="text" class="observer-name" name="name" value="${name}" />
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
   * Method used to return observer title component contents
   * @param {Object} component The title component which data to receive
   * @returns HTML with observer title component contetns
   */
  static #getObserverTitleComponentHtml(component) {
    const selector = component !== undefined ? component.selector : "";
    const attribute = component !== undefined ? component.attribute : "";
    const auxiliary = component !== undefined ? component.auxiliary : "";
    return `<div class="component-card" active>
              <h3 class="card-title">title config</h3>
              <div class="component-content">
                <div class="widget">
                  <label class="component-title-label">selector:</label>
                  <input type="text" class="component-title-selector" name="selector" value="${selector}" />
                </div>
                <div class="widget">
                  <label class="component-title-label">attribute:</label>
                  <input type="text" class="component-title-attribute" name="attribute" value="${attribute}" />
                </div>
                <div class="widget">
                  <label class="component-title-label">auxiliary:</label>
                  <input type="text" class="component-title-auxiliary" name="auxiliary" value="${auxiliary}" />
                </div>
              </div>
            </div>`;
  }

  /**
   * Method used to return observer image component contents
   * @param {Object} component The image component which data to receive
   * @returns HTML with observer image component contetns
   */
  static #getObserverImageComponentHtml(component) {
    const selector = component !== undefined ? component.selector : "";
    const attribute = component !== undefined ? component.attribute : "";
    const auxiliary = component !== undefined ? component.auxiliary : "";
    return `<div class="component-card">
              <h3 class="card-title">image config</h3>
              <div class="component-content">
                <div class="widget">
                  <label class="component-image-label">selector:</label>
                  <input type="text" class="component-image-selector" name="selector" value="${selector}" />
                </div>
                <div class="widget">
                  <label class="component-image-label">attribute:</label>
                  <input type="text" class="component-image-attribute" name="attribute" value="${attribute}" />
                </div>
                <div class="widget">
                  <label class="component-image-label">auxiliary:</label>
                  <input type="button" class="component-image-auxiliary" name="auxiliary" value="Select image" />
                </div>
              </div>
            </div>`;
  }

  /**
   * Method used to return observer price component contents
   * @param {Object} component The price component which data to receive
   * @returns HTML with observer price component contetns
   */
  static #getObserverPriceComponentHtml(component) {
    const selector = component !== undefined ? component.selector : "";
    const attribute = component !== undefined ? component.attribute : "";
    const auxiliary = component !== undefined ? component.auxiliary : "";
    return `<div class="component-card">
              <h3 class="card-title">price config</h3>
              <div class="component-content">
                <div class="widget">
                  <label class="component-price-label">selector:</label>
                  <input type="text" class="component-price-selector" name="selector" value="${selector}" />
                </div>
                <div class="widget">
                  <label class="component-price-label">attribute:</label>
                  <input type="text" class="component-price-attribute" name="attribute" value="${attribute}" />
                </div>
                <div class="widget">
                  <label class="component-price-label">auxiliary:</label>
                  <select class="component-price-auxiliary" name="auxiliary" required>
                    <option value="" disabled hidden ${auxiliary === "" ? "selected" : ""}>Select value</option>
                    <option value=PLN ${auxiliary === "PLN" ? "selected" : ""}>PLN</option>
                    <option value=GBP ${auxiliary === "GBP" ? "selected" : ""}>GBP</option>
                    <option value=USD ${auxiliary === "USD" ? "selected" : ""}>USD</option>
                    <option value=EUR ${auxiliary === "EUR" ? "selected" : ""}>EUR</option>
                  </select>
                </div>
              </div>
            </div>`;
  }

  /**
   * Method used to receive observer modal dialog buttons HTML code
   * @param {String} groupId The observer parent group identifier
   * @param {Object} observer The observer for which we want to generate buttons code
   * @returns HTML clode containing modal dialog buttons for specified observer
   */
  static #getObserverModalButtonsHtml(groupId, observer) {
    const dataId = observer !== undefined ? observer.name : groupId;
    const dataAction = observer !== undefined ? "update" : "add";
    return `<div class="modal-close-btn accept" data-action="${dataAction}" data-id="${dataId}">ok</div>
            <div class="modal-close-btn delete" data-action="delete" data-id="${dataId}">delete</div>
            <div class="modal-close-btn cancel" data-action="cancel">cancel</div>`;
  }
}

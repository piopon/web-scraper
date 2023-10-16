export class ObserversView {
  /**
   * Method used to receive HTML code representing input observers array
   * @param {Array} observers The array of observers which HTML code we want to get
   */
  static getHtml = function (observers) {
    let result = "";
    observers.forEach((observer) => {
      result += ObserversView.#getExistingObserverHtml(observer);
    });
    result += ObserversView.#getNewObserverHtml();
    return result;
  };

  /**
   * Method used to receive HTML code representing observer object
   * @param {Object} observer The observer object which HTML code we want to get
   */
  static #getExistingObserverHtml(observer) {
    return `<div class="observer-content">
              ${ObserversView.#getObserverModalHtml(observer)}
              <div class="modal-button">${observer.name}</div>
            </div>`;
  }

  /**
   * Method used to receive HTML code representing new observer UI
   */
  static #getNewObserverHtml() {
    return `<div class="observer-content">
              ${ObserversView.#getObserverModalHtml(undefined)}
              <div class="modal-button new-observer">+</div>
            </div>`;
  }

  static #getObserverModalHtml(observer) {
    return `<div class="modal-dialog hidden">
              <div class="modal-background">
                <div class="modal-content">
                </div>
              </div>
            </div>`;
  }

  static #getObserverTitleComponentHtml(component) {
    return `<div class="component-card" active>
              <h3 class="card-title">title config</h3>
              <div class="component-content">
                <div class="widget">
                  <label class="component-title-label">selector:</label>
                  <input type="text" class="component-title-selector" name="selector" value="${component.selector}" />
                </div>
                <div class="widget">
                  <label class="component-title-label">attribute:</label>
                  <input type="text" class="component-title-attribute" name="attribute" value="${component.attribute}" />
                </div>
                <div class="widget">
                  <label class="component-title-label">auxiliary:</label>
                  <input type="text" class="component-title-auxiliary" name="auxiliary" value="${component.auxiliary}" />
                </div>
              </div>
            </div>`;
  }

  static #getObserverImageComponentHtml(component) {
    return `<div class="component-card" >
              <h3 class="card-title">image config</h3>
              <div class="component-content">
                <div class="widget">
                  <label class="component-image-label">selector:</label>
                  <input type="text" class="component-image-selector" name="selector" value="${component.selector}" />
                </div>
                <div class="widget">
                  <label class="component-image-label">attribute:</label>
                  <input type="text" class="component-image-attribute" name="attribute" value="${component.attribute}" />
                </div>
                <div class="widget">
                  <label class="component-image-label">auxiliary:</label>
                  <input type="button" class="component-image-auxiliary" name="auxiliary" value="Select image" />
                </div>
              </div>
            </div>`;
  }

  static #getObserverPriceComponentHtml(component) {
    return `<div class="component-card" >
              <h3 class="card-title">price config</h3>
              <div class="component-content">
                <div class="widget">
                  <label class="component-price-label">selector:</label>
                  <input type="text" class="component-price-selector" name="selector" value="${component.selector}" />
                </div>
                <div class="widget">
                  <label class="component-price-label">attribute:</label>
                  <input type="text" class="component-price-attribute" name="attribute" value="${component.attribute}" />
                </div>
                <div class="widget">
                  <label class="component-price-label">auxiliary:</label>
                  <select class="component-price-auxiliary" name="auxiliary" required>
                    <option value="" disabled hidden>Select value</option>
                    <option value=PLN ${component.price === "PLN" ? "selected" : ""}>PLN</option>
                    <option value=GBP ${component.price === "GBP" ? "selected" : ""}>GBP</option>
                    <option value=USD ${component.price === "USD" ? "selected" : ""}>USD</option>
                    <option value=EUR ${component.price === "EUR" ? "selected" : ""}>EUR</option>
                  </select>
                </div>
              </div>
            </div>`;
  }
}

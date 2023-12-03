export class ComponentsView {
  static COMPONENT_TITLE = 0;
  static COMPONENT_IMAGE = 1;
  static COMPONENT_PRICE = 2;

  /**
   * Method used to receive HTML code representing specified component contents
   * @param {Object} titleComponent The component containing title information
   * @param {Object} imageComponent The component containing image information
   * @param {Object} priceComponent The component containing price information
   * @return HTML code with all components cards contents
   */
  static toHtml(type, component) {
    switch (type) {
      case ComponentsView.COMPONENT_TITLE:
        return ComponentsView.#getTitleComponentHtml(component);
      case ComponentsView.COMPONENT_IMAGE:
        return ComponentsView.#getImageComponentHtml(component);
      case ComponentsView.COMPONENT_PRICE:
        return ComponentsView.#getPriceComponentHtml(component);
      default:
        console.error(`Internal error! Unknown component type: ${type}`);
        return ComponentsView.#getUnknownTypeErrorHtml(type);
    }
  }

  /**
   * Method used to return title component contents
   * @param {Object} component The title component which data to receive
   * @returns HTML with title component contetns
   */
  static #getTitleComponentHtml(component) {
    const selector = component !== undefined ? component.selector : "";
    const attribute = component !== undefined ? component.attribute : "";
    const auxiliary = component !== undefined ? component.auxiliary : "";
    return `<div class="component-card" active>
              <h3 class="card-title">title config</h3>
              <div class="component-content">
                <div class="component-fields">
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
                <div class="component-toggle">
                  <p>auto</p>
                  <input type="checkbox" class="check-auto-manual">
                  <label for="check-auto-manual"></label>
                  <p>manual</p>
                </div>
              </div>
            </div>`;
  }

  /**
   * Method used to return image component contents
   * @param {Object} component The image component which data to receive
   * @returns HTML with image component contetns
   */
  static #getImageComponentHtml(component) {
    const selector = component !== undefined ? component.selector : "";
    const attribute = component !== undefined ? component.attribute : "";
    const auxiliary = component !== undefined ? component.auxiliary : "";
    return `<div class="component-card">
              <h3 class="card-title">image config</h3>
              <div class="component-content">
                <div class="component-fields">
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
                <div class="component-toggle">
                  <p>auto</p>
                  <input type="checkbox" class="check-auto-manual">
                  <label for="check-auto-manual"></label>
                  <p>manual</p>
                </div>
              </div>
            </div>`;
  }

  /**
   * Method used to return price component contents
   * @param {Object} component The price component which data to receive
   * @returns HTML with price component contetns
   */
  static #getPriceComponentHtml(component) {
    const selector = component !== undefined ? component.selector : "";
    const attribute = component !== undefined ? component.attribute : "";
    const auxiliary = component !== undefined ? component.auxiliary : "";
    return `<div class="component-card">
              <h3 class="card-title">price config</h3>
              <div class="component-content">
                <div class="component-fields">
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
                    ${ComponentsView.#getCurrenciesOptionsHtml(auxiliary)}
                    </select>
                  </div>
                </div>
              </div>
            </div>`;
  }

  static #getUnknownTypeErrorHtml(type) {
    return `<div class="component-card" style="background: red">
              <h3 class="card-title">unknown type: ${type}</h3>
              <div class="component-content">
                <div class="component-fields">
                  <p>internal error - unknown component type: ${type}</p>
                </div>
              </div>
            </div>`;
  }

  /**
   * Method used to retrieve select options with all supported currencies
   * @param {String} selectedCurrency The currently selected currency
   * @returns HTML code with all possible options for select tag
   */
  static #getCurrenciesOptionsHtml(selectedCurrency) {
    let result = `<option value="" disabled hidden ${selectedCurrency === "" ? "selected" : ""}>Select value</option>`;
    sessionStorage.getItem("currencies").split(",").forEach(currency => {
      result += `<option value=${currency} ${selectedCurrency === currency ? "selected" : ""}>${currency}</option>`;
    })
    return result;
  }
}

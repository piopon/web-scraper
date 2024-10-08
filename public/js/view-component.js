export class ComponentsView {
  static COMPONENT_TITLE = 0;
  static COMPONENT_IMAGE = 1;
  static COMPONENT_PRICE = 2;

  /**
   * Creates a component object from the provided HTML element
   * @param {Number} type The type of the component which we want to convert from HTML
   * @param {Element} componentHtml The HTML content from which we want to create a component object
   * @returns Object with component data retrieved from input HTML element
   */
  static fromHtml(type, componentHtml) {
    switch (type) {
      case ComponentsView.COMPONENT_TITLE:
        return {
          interval: "",
          selector: componentHtml.querySelector("input.component-title-selector").value,
          attribute: componentHtml.querySelector("input.component-title-attribute").value,
          auxiliary: componentHtml.querySelector("input.component-title-auxiliary").value,
        };
      case ComponentsView.COMPONENT_IMAGE:
        // we need to check image auxiliary value to correctly determine if empty or not
        const imageAux = componentHtml.querySelector("input.component-image-auxiliary-button").value;
        return {
          interval: "",
          selector: componentHtml.querySelector("input.component-image-selector").value,
          attribute: componentHtml.querySelector("input.component-image-attribute").value,
          auxiliary: imageAux === "Select image" ? "" : imageAux,
        };
      case ComponentsView.COMPONENT_PRICE:
        return {
          interval: "",
          selector: componentHtml.querySelector("input.component-price-selector").value,
          attribute: componentHtml.querySelector("input.component-price-attribute").value,
          auxiliary: componentHtml.querySelector("select.component-price-auxiliary").value,
        };
      default:
        console.error(`Internal error! Unknown component type: ${type}`);
        return null;
    }
  }

  /**
   * Method used to convert JS component objects to HTML code representing those components
   * @param {Number} type The type of the component which we want to convert to HTML
   * @param {Object} componentData The component object which we want to convert to HTML
   * @return HTML code with all components cards contents
   */
  static toHtml(type, componentData) {
    switch (type) {
      case ComponentsView.COMPONENT_TITLE:
        return ComponentsView.#getTitleComponentHtml(componentData);
      case ComponentsView.COMPONENT_IMAGE:
        return ComponentsView.#getImageComponentHtml(componentData);
      case ComponentsView.COMPONENT_PRICE:
        return ComponentsView.#getPriceComponentHtml(componentData);
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
    const auxButton = "" === auxiliary ? "Select image" : auxiliary;
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
                    <div class="component-image-file-container">
                      <input type="file" name="auxiliary-file" class="component-image-auxiliary-file" accept="image/*"/>
                      <input type="button" name="auxiliary-select" class="component-image-auxiliary-button" value="${auxButton}"/>
                      <input type="submit" name="auxiliary-upload" class="component-image-auxiliary-submit" value="upload"/>
                    </div>
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

  /**
   * Method used tp receive HTML to display unknown type error
   * @param {Number} type The invalid component type for which we want to display error
   * @returns HTML component code with error message
   */
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
    sessionStorage
      .getItem("currencies")
      .split(",")
      .forEach((currency) => {
        const selectedAttribute = selectedCurrency === currency ? "selected" : "";
        result += `<option value=${currency} ${selectedAttribute}>${currency}</option>`;
      });
    return result;
  }
}

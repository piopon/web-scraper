export class ObserversService {
  /**
   * Method used to add new observer to the specified parent
   * @param {String} parentId The identifier of the observer parent
   * @returns promise containing the response text or error
   */
  static async addObserver(parentId) {
    const encodedParentId = encodeURIComponent(parentId);
    const url = `api/v1/configs/groups/observers?parent=${encodedParentId}`;
    const response = await fetch(url, this.#createSetRequestOptions("POST"));
    if (response.status === 200) {
      return response.text();
    }
    throw new Error(`Cannot add observer to ${parentId}`);
  }

  /**
   * Method used to update observer with the specified name
   * @param {String} observerName The name of the observer to be updated
   * @returns promise containing the response text or error
   */
  static async updateObserver(observerName) {
    const encodedObserverId = encodeURIComponent(observerName);
    const url = `api/v1/configs/groups/observers?name=${encodedObserverId}`;
    const response = await fetch(url, this.#createSetRequestOptions("PUT"));
    if (response.status === 200) {
      return response.text();
    }
    throw new Error(`Cannot update observer ${observerName}`);
  }

  /**
   * Method used to create an observer objest from values of the HTML elements
   * @returns observer object with values from current HTML elements
   */
  static #createObserver() {
    const editedObserver = document.querySelector("div.modal-dialog.init-reveal:not(.hidden)");
    return {
      name: editedObserver.querySelector("input.observer-name").value,
      path: editedObserver.querySelector("input.observer-path").value,
      target: editedObserver.querySelector("select.observer-target").value,
      history: editedObserver.querySelector("select.observer-history").value,
      container: editedObserver.querySelector("input.observer-container").value,
      title: {
        interval: "",
        selector: editedObserver.querySelector("input.component-title-selector").value,
        attribute: editedObserver.querySelector("input.component-title-attribute").value,
        auxiliary: editedObserver.querySelector("input.component-title-auxiliary").value,
      },
      image: {
        interval: "",
        selector: editedObserver.querySelector("input.component-image-selector").value,
        attribute: editedObserver.querySelector("input.component-image-attribute").value,
        auxiliary: editedObserver.querySelector("input.component-image-auxiliary").value,
      },
      price: {
        interval: "",
        selector: editedObserver.querySelector("input.component-price-selector").value,
        attribute: editedObserver.querySelector("input.component-price-attribute").value,
        auxiliary: editedObserver.querySelector("select.component-price-auxiliary").value,
      },
    };
  }

  /**
   * Method used to create request options
   * @param {String} method The HTTP method of the request (one of set methods: POST, PUT)
   * @returns request options object
   */
  static #createSetRequestOptions(method) {
    return {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.#createObserver()),
    };
  }
}

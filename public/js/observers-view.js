export class ObserversView {
  /**
   * Method used to receive HTML code representing input observers array
   * @param {Array} observers The array of observers which HTML code we want to get
   */
  static getHtml = function (observers) {
    observers.forEach((observer) => {
      ObserversView.#getExistingObserverHtml(observer);
    });
    ObserversView.#getNewObserverHtml();
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
}

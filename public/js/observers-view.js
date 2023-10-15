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
    console.log(observer);
  }

  /**
   * Method used to receive HTML code representing new observer UI
   */
  static #getNewObserverHtml() {
    console.log("new observer button");
  }
}

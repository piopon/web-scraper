import { ObserversView } from "./view-observer.js";

export class CommonService {
  /**
   * Method used to return error string from the input error response object
   * @param {Object} errorResponse The object containing error details
   * @returns string with error message received from error response object
   */
  static getErrorDetails(errorResponse) {
    if (errorResponse instanceof Array) {
      if (0 === errorResponse.length) {
        return "Unexpected empty array response";
      }
      if (!errorResponse[0].instancePath || !errorResponse[0].message) {
        return "Unexpected array response";
      }
      return `${errorResponse[0].instancePath} ${errorResponse[0].message}`;
    } else if (errorResponse instanceof String || 'string' === typeof(errorResponse)) {
      return errorResponse;
    } else {
      return "Unexpected response type";
    }
  }

  /**
   * Method used to create a group objest from values of the HTML elements
   * @param {Element} groupHtmlElement The HTML content from which we want to create a group object
   * @returns Object with group data retrieved from input HTML element
   */
  static createGroup(groupHtmlElement) {
    const groupObservers = groupHtmlElement.querySelectorAll("div.modal-button:not(.new-observer)");
    return {
      name: groupHtmlElement.querySelector("input.group-name").value,
      category: groupHtmlElement.querySelector("input.group-category").value,
      domain: groupHtmlElement.querySelector("input.group-domain").value,
      observers: this.#createGroupObservers(groupObservers),
    };
  }

  /**
   * Method used to create an array of observer objects from provided list of HTML elements
   * @param {NodeList} observers The list of HTML observer elemenets
   * @returns array of observer objects created from provided input
   */
  static #createGroupObservers(observers) {
    const result = [];
    observers.forEach((observer) => {
      const observerContent = observer.parentNode.querySelector("div.modal-content");
      result.push(ObserversView.createObserver(observerContent));
    });
    return result;
  }
}
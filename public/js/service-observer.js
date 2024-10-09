import { CommonService } from "./service-common.js";
import { ObserversView } from "./view-observer.js";

export class ObserversService {
  /**
   * Method used to add new observer to the specified parent
   * @param {String} parentId The identifier of the parent to which we want to add new observer
   * @returns promise containing the operation response text or error
   */
  static async addObserver(parentId) {
    const url = `api/v1/config/groups/observers?parent=${encodeURIComponent(parentId)}`;
    const openedObserver = document.querySelector("div.modal-dialog.init-reveal:not(.hidden)");
    const requestBody = JSON.stringify(ObserversView.fromHtml(openedObserver));
    const requestOpts = CommonService.createRequestOptions("POST", requestBody, CommonService.TYPE_JSON);
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot add observer: ${errorDetails}`);
  }

  /**
   * Method used to get observers from the specified parent
   * @param {String} parentId The identifier of the parent for which we want get observers
   * @returns promise containing the operation response JSON or error
   */
  static async getObservers(parentId) {
    const url = `api/v1/config/groups?name=${encodeURIComponent(parentId)}`;
    const requestOpts = CommonService.createRequestOptions("GET");
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot get ${parentId} observers: ${errorDetails}`);
  }

  /**
   * Method used to update observer with the specified name
   * @param {String} observerId The identifier of the observer to be updated
   * @returns promise containing the operation response text or error
   */
  static async updateObserver(observerId) {
    const url = `api/v1/config/groups/observers?name=${encodeURIComponent(observerId)}`;
    const openedObserver = document.querySelector("div.modal-dialog.init-reveal:not(.hidden)");
    const requestBody = JSON.stringify(ObserversView.fromHtml(openedObserver));
    const requestOpts = CommonService.createRequestOptions("PUT", requestBody, CommonService.TYPE_JSON);
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot update observer: ${errorDetails}`);
  }

  /**
   * Method used to delete observer with the specified name
   * @param {String} observerId The identifier of the observer to be deleted
   * @returns promise containing the operation response text or error
   */
  static async deleteObserver(observerId) {
    const url = `api/v1/config/groups/observers?name=${encodeURIComponent(observerId)}`;
    const requestOpts = CommonService.createRequestOptions("DELETE");
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot delete observer: ${errorDetails}`);
  }
}

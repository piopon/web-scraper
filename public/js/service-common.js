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
}
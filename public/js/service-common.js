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
    } else if (errorResponse instanceof String || "string" === typeof errorResponse) {
      return errorResponse;
    } else {
      return "Unexpected response type";
    }
  }

  /**
   * Method used to create request options
   * @param {String} requestMethod The HTTP method of the request
   * @param {Object} requestBody The HTTP body of the request
   * @returns request options object
   */
  static createRequestOptions(requestMethod, requestBody = undefined, contentType = "application/json") {
    return {
      method: requestMethod,
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${localStorage.getItem("JWT")}`,
      },
      body: requestBody,
    };
  }
}

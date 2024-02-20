import { CommonService } from "./service-common.js";

export class StatusService {
  /**
   * Method used to get specified component work status and history
   * @param {String} componentName The component name to get status (or all if not specified)
   * @param {Boolean} withHistory Flag indicating if full history should be received (default: false)
   * @returns promise containing the operation response JSON or error
   */
  static async getStatus(componentName = undefined, withHistory = false) {
    const componentUrl = componentName ? `name=${componentName}&` : "";
    const url = `/api/v1/status?${componentUrl}history=${withHistory}`;
    const response = await fetch(url, CommonService.createRequestOptions("GET"));
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot get status: ${errorDetails}`);
  }
}

import { CommonService } from "./service-common.js";

export class StatusService {
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

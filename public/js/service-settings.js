import { CommonService } from "./service-common.js";

export class SettingsService {
  /**
   * Method used to retrieve current scraper configuration from backend
   * @returns promise containing the operation response text or error
   */
  static async getConfig() {
    const url = `/api/v1/config`;
    const requestOpts = CommonService.createRequestOptions("GET");
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot get current configuration: ${errorDetails}`);
  }

  /**
   * Method used to invoke the import configuration action from backend
   * @param {File} configFile The configuration file which contents should be imported
   * @returns promise containing the operation response text or error
   */
  static async importConfig(configFile) {
    const url = `/api/v1/settings/import`;
    const requestBody = await configFile.files[0].text();
    const requestOpts = CommonService.createRequestOptions("POST", requestBody, CommonService.TYPE_JSON);
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot import configuration: ${errorDetails}`);
  }
}

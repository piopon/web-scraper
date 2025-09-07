import { CommonService } from "./service-common.js";

export class SettingsService {
  static async importConfig(configFile) {
    const url = `/api/v1/settings/import`;
    const requestOpts = CommonService.createRequestOptions("POST", configFile, CommonService.TYPE_JSON);
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot import configuration: ${errorDetails}`);
  }
}

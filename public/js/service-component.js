import { CommonService } from "./service-common.js";

export class ComponentService {
  /**
   * Method used to add new image to the user specified component
   * @param {Element} inputFile The HTML input element used for file selection
   * @returns promise containing the operation response text or error
   */
  static async addImage(inputFile) {
    const url = `/image`;
    const requestBody = new FormData();
    requestBody.append(inputFile.getAttribute("name"), inputFile.files[0]);
    const response = await fetch(url, { method: 'POST', body: requestBody });
    if (response.status === 200) {
        return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot upload image: ${errorDetails}`);
  }
}
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
    // for images (generally: multipart/*) we deliberately do NOT define the content type
    // thus the browser will detect and set it automatically with correct boundary value
    const requestOpts = CommonService.createRequestOptions("POST", requestBody);
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot upload image: ${errorDetails}`);
  }
}

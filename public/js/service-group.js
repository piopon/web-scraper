export class GroupsService {
  /**
   * Method used to create a group objest from values of the HTML elements
   * @returns group object with values from current HTML elements
   */
  static #createGroup() {
    const editedGroup = document.querySelector("article.group-column.expanded");
    return {
      name: editedGroup.querySelector("h2.group-title").innerText
    };
  }

  /**
   * Method used to create request options
   * @param {String} method The HTTP method of the request
   * @returns request options object
   */
  static #createRequestOptions(method) {
    const shouldHaveBody = "POST" === method || "PUT" === method;
    const requestBody = shouldHaveBody ? JSON.stringify(this.#createGroup()) : undefined;
    return {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    };
  }
}

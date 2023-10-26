export class GroupsService {
  /**
   * Method used to add new gropu to the specified parent user
   * @param {String} userId The identifier of the user to which we want to add new group
   * @returns promise containing the operation response text or error
   */
  static async addGroup(userId) {
    const encodedId = encodeURIComponent(userId);
    const url = `api/v1/configs/groups?parent=${encodedId}`;
    const response = await fetch(url, this.#createRequestOptions("POST"));
    if (response.status === 200) {
      return response.text();
    }
    throw new Error(`Cannot add group to user ${userId}`);
  }

  /**
   * Method used to create a group objest from values of the HTML elements
   * @returns group object with values from current HTML elements
   */
  static #createGroup() {
    const editedGroup = document.querySelector("article.group-column.expanded");
    return {
      name: editedGroup.querySelector("input.group-name").value,
      category: editedGroup.querySelector("input.group-category").value,
      domain: editedGroup.querySelector("input.group-domain").value,
      observers: [],
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

export class GroupsService {
  /**
   * Method used to add new group to the specified parent user
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
   * Method used to update group with the specified identifier
   * @param {String} groupId The identifier of the group which should be updated
   * @returns promise containing the operation response text or error
   */
  static async updateGroup(groupId) {
    const encodedId = encodeURIComponent(groupId);
    const url = `api/v1/configs/groups?parent=${encodedId}`;
    const response = await fetch(url, this.#createRequestOptions("PUT"));
    if (response.status === 200) {
      return response.text();
    }
    throw new Error(`Cannot update group ${groupId}`);
  }

  /**
   * Method used to create a group objest from values of the HTML elements
   * @returns group object with values from current HTML elements
   */
  static #createGroup() {
    const editedGroup = document.querySelector("article.group-column.expanded");
    const editedGroupObservers = editedGroup.querySelectorAll("div.modal-button:not(.new-observer)");
    return {
      name: editedGroup.querySelector("input.group-name").value,
      category: editedGroup.querySelector("input.group-category").value,
      domain: editedGroup.querySelector("input.group-domain").value,
      observers: this.#createGroupObservers(editedGroupObservers),
    };
  }

  /**
   * Method used to create an array of observer objects from provided list of HTML elements
   * @param {NodeList} observers The list of HTML observer elemenets
   * @returns array of observer objects created from provided input
   */
  static #createGroupObservers(observers) {
    const result = [];
    observers.forEach((observer) => {
      const observerContent = observer.parentNode;
      console.log(observerContent);
    });
    return result;
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

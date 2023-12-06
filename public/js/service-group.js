import { CommonService } from "./service-common.js";
import { GroupsView } from "./view-group.js";

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
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot add group: ${errorDetails}`);
  }

  /**
   * Method used to get groups from the specified parent
   * @param {String} userId The identifier of the parent for which we want get groups
   * @returns promise containing the operation response JSON or error
   */
  static async getGroups(userId) {
    const encodedId = encodeURIComponent(userId);
    const url = `api/v1/configs?user=${encodedId}`;
    const response = await fetch(url, this.#createRequestOptions("GET"));
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot get ${parentId} observers: ${errorDetails}`);
  }

  /**
   * Method used to update group with the specified identifier
   * @param {String} groupId The identifier of the group which should be updated
   * @returns promise containing the operation response text or error
   */
  static async updateGroup(groupId) {
    const encodedId = encodeURIComponent(groupId);
    const url = `api/v1/configs/groups?name=${encodedId}`;
    const response = await fetch(url, this.#createRequestOptions("PUT"));
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot update group: ${errorDetails}`);
  }

  /**
   * Method used to delete group with the specified identifier
   * @param {String} groupId The identifier of the group which should be deleted
   * @returns promise containing the operation response text or error
   */
  static async deleteGroup(groupId) {
    const encodedId = encodeURIComponent(groupId);
    const url = `api/v1/configs/groups?name=${encodedId}`;
    const response = await fetch(url, this.#createRequestOptions("DELETE"));
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot delete group: ${errorDetails}`);
  }

  /**
   * Method used to create request options
   * @param {String} method The HTTP method of the request
   * @returns request options object
   */
  static #createRequestOptions(method) {
    const shouldHaveBody = "POST" === method || "PUT" === method;
    const expandedGroup = document.querySelector("article.group-column.expanded");
    const requestBody = shouldHaveBody ? JSON.stringify(GroupsView.fromHtml(expandedGroup)) : undefined;
    return {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    };
  }
}

import { CommonService } from "./service-common.js";
import { GroupsView } from "./view-group.js";

export class GroupsService {
  /**
   * Method used to add new group to the specified parent user
   * @returns promise containing the operation response text or error
   */
  static async addGroup() {
    const url = `api/v1/config/groups`;
    const expandedGroup = document.querySelector("article.group-column.expanded");
    const requestBody = JSON.stringify(GroupsView.fromHtml(expandedGroup));
    const requestOpts = CommonService.createRequestOptions("POST", requestBody, CommonService.TYPE_JSON);
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot add group: ${errorDetails}`);
  }

  /**
   * Method used to get groups from the specified parent
   * @returns promise containing the operation response JSON or error
   */
  static async getGroups() {
    const url = `api/v1/config`;
    const requestOpts = CommonService.createRequestOptions("GET");
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot get user groups: ${errorDetails}`);
  }

  /**
   * Method used to update group with the specified identifier
   * @param {String} groupId The identifier of the group which should be updated
   * @returns promise containing the operation response text or error
   */
  static async updateGroup(groupId) {
    const url = `api/v1/config/groups?name=${encodeURIComponent(groupId)}`;
    const expandedGroup = document.querySelector("article.group-column.expanded");
    const requestBody = JSON.stringify(GroupsView.fromHtml(expandedGroup));
    const requestOpts = CommonService.createRequestOptions("PUT", requestBody, CommonService.TYPE_JSON);
    const response = await fetch(url, requestOpts);
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
    const url = `api/v1/config/groups?name=${encodeURIComponent(groupId)}`;
    const requestOpts = CommonService.createRequestOptions("DELETE");
    const response = await fetch(url, requestOpts);
    if (response.status === 200) {
      return response.json();
    }
    const errorResponse = await response.json();
    const errorDetails = CommonService.getErrorDetails(errorResponse);
    throw new Error(`Cannot delete group: ${errorDetails}`);
  }
}

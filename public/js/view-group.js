import { ObserversView } from "./view-observer.js";

export class GroupsView {
  /**
   * Method used to receive HTML code representing input group array
   * @param {String} userId The groups parent user identifier
   * @param {Array} groups The array of groups which HTML code we want to get
   * @return HTML code with all groups contents
   */
  static getHtml(userId, groups) {
    let result = "";
    groups.forEach((group) => {
      result += GroupsView.#getExistingGroupHtml(group);
    });
    result += GroupsView.#getNewGroupHtml(userId);
    return result;
  }

  /**
   * Method used to receive HTML code representing group object
   * @param {Object} group The group object which HTML code we want to get
   * @returns HTML code with existing group contents
   */
  static #getExistingGroupHtml(group) {
    return "";
  }

  /**
   * Method used to receive HTML code representing new group UI
   * @param {String} userId The group parent (user) identifier
   * @returns HTML code with new group UI contents
   */
  static #getNewGroupHtml(userId) {
    return "";
  }

  static #getGroupContentHtml(userId, group) {
    const groupId = group !== undefined ? group.name : undefined;
    const groupObservers = group !== undefined ? group.observers : [];
    return `<div class="group-content">
              <div class="group-root-data">
              ${GroupsView.#getGroupRootDataHtml(group)}
              </div>
              <div class="group-observers">
                <div class="observers-title">
                  <label class="group-label">observers:</label>
                </div>
                <div class="observers-container">
                  ${ObserversView.getHtml(groupId, groupObservers)}
                </div>
              </div>
              <div class="group-buttons">
                ${GroupsView.#getGroupButtonsHtml(userId, group)}
              </div>
            </div>`;
  }

  static #getGroupRootDataHtml(group) {
    const name = group !== undefined ? group.name : "";
    const domain = group !== undefined ? group.domain : "";
    const category = group !== undefined ? group.category : "";
    const disabled = group !== undefined ? "disabled" : "";
    return `<div class="widget">
              <label class="group-label">name:</label>
              ${group === undefined ? `<div class="id"></div>` : ""}
              <input type="text" class="group-name" name="name" value="${name}" ${disabled}/>
            </div>
            <div class="widget">
              <label class="group-label">domain:</label>
              <input type="text" class="group-domain" name="domain" value="${domain}"/>
            </div>
            <div class="widget">
              <label class="group-label">category:</label>
              <input type="button" class="group-category" name="category" value="${category}"/>
            </div>`;
  }

  static #getGroupButtonsHtml(userId, group) {
    if (group === undefined) {
      // no group provided = we are adding a new one
      return `<div class="group-close-btn accept" data-action="add" data-id="${userId}">add</div>
              <div class="group-close-btn cancel" data-action="cancel">cancel</div>`;
    }
    // provided is an edited one
    return `<div class="group-close-btn accept" data-action="update" data-id="${group.name}">update</div>
            <div class="group-close-btn delete" data-action="delete" data-id="${group.name}">delete</div>
            <div class="group-close-btn cancel" data-action="cancel">cancel</div>`;
  }
}

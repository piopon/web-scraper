import { ObserversView } from "./view-observer.js";

export class GroupsView {
  /**
   * Method used to receive HTML code representing input group array
   * @param {String} userId The groups parent user identifier
   * @param {Array} groups The array of groups which HTML code we want to get
   * @return HTML code with all groups contents
   */
  static toHtml(group) {
    if (group === null) {
      return "Invalid group! Cannot create HTML from a null parameter";
    }
    if ('object' === typeof(group) && !Array.isArray(group)) {
      // adding HTML for an existing group
      return GroupsView.#getExistingGroupHtml(group);
    } else if (Number.isFinite(group)) {
      // adding HTML for a new group
      return GroupsView.#getNewGroupHtml(group);
    } else {
      return "Invalid group! Must be an group object or ID string";
    }
  }

  /**
   * Method used to receive HTML code representing group object
   * @param {Object} group The group object which HTML code we want to get
   * @returns HTML code with existing group contents
   */
  static #getExistingGroupHtml(group) {
    return `<article class="group-column">
              <div class="group-container" data-action="update">
                <h2 class="group-title">${group.name}</h2>
                ${GroupsView.#getGroupContentHtml(undefined, group)}
              </div>
            </article>`;
  }

  /**
   * Method used to receive HTML code representing new group UI
   * @param {String} userId The group parent (user) identifier
   * @returns HTML code with new group UI contents
   */
  static #getNewGroupHtml(userId) {
    return `<article class="group-column">
              <div class="group-container" data-action="add">
                <h2 class="group-title">+</h2>
                <h3 class="group-hint">add group</h3>
                ${GroupsView.#getGroupContentHtml(userId, undefined)}
              </div>
            </article>`;
  }

  /**
   * Method used to receive group content HTML code
   * @param {String} userId The group parent user identifier
   * @param {Object} group The group for which we want to generate content code
   * @returns HTML code containing content for specified group
   */
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
                  ${GroupsView.#getGroupObserversHtml(groupId, groupObservers)}
                </div>
              </div>
              <div class="group-buttons">
                ${GroupsView.#getGroupButtonsHtml(userId, group)}
              </div>
            </div>`;
  }

  /**
   * Method used to receive HTML code with specified group root data
   * @param {Object} group The group for which we want to get root data code
   * @returns HTML code containing root data for specified group
   */
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

  /**
   * Method used to receive group observers HTML code
   * @param {String} groupId The observers parent group identifier
   * @param {Array} groupObservers The array of observers which HTML code we want to get
   * @return HTML code with all observers contents
   */
  static #getGroupObserversHtml(groupId, groupObservers) {
    let html = "";
    groupObservers.forEach((observer) => (html += ObserversView.toHtml(observer)));
    return html + ObserversView.toHtml(groupId);
  }

  /**
   * Method used to receive group action buttons HTML code
   * @param {String} userId The group parent user identifier
   * @param {Object} group The group for which we want to generate buttons code
   * @returns HTML code containing action buttons for specified group
   */
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

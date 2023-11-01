export class ObserversView {
  /**
   * Method used to receive HTML code representing input group array
   * @param {String} userId The groups parent user identifier
   * @param {Array} groups The array of groups which HTML code we want to get
   * @return HTML code with all groups contents
   */
  static getHtml(userId, groups) {
    let result = "";
    groups.forEach((group) => {
      result += ObserversView.#getExistingGroupHtml(group);
    });
    result += ObserversView.#getNewGroupHtml(userId);
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
}

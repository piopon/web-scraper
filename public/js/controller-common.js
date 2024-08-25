export class CommonController {
  static #TOAST_TIMEOUT_MS = 6000;
  static #TYPE_ERROR = -1;
  static #TYPE_SUCCESS = 0;
  static #TYPE_WARNING = 1;

  /**
   * Method used to find a specific group column container which has title equal to specified group name
   * @param {String} groupName The name of the group column which we want to find
   * @returns Group column container with title matching the name, or undefined if no container found
   */
  static getGroupColumnWithName(groupName) {
    const foundColumns = Array.from(document.querySelectorAll("article.group-column h2.group-title"))
        .filter((element) => element.innerText === groupName)
        .map((element) => element.closest("article.group-column"));
    if (1 !== foundColumns.length) {
      showToastError(`Internal error! Found ${foundColumns.length} columns with name: ${groupName}`);
      return undefined;
    }
    return foundColumns[0];
  }

  /**
   * Method used to convert HTML string/code to HTML element/object
   * @param {String} string The input HTML code to be converted
   * @returns HTML element node from code
   */
  static htmlToElement(string) {
    var tempContainer = document.createElement('div');
    tempContainer.innerHTML = string;
    return tempContainer.firstChild;
  }

  /**
   * Method used to update the enabled state of each HTML element
   * @param {Element} element The HTML element which enabled state want to update
   * @param {Boolean} enabled Flag indicating if element should be enabled (true) or not (false)
   */
  static enableElement(element, enabled) {
    if (enabled) {
      element.removeAttribute("disabled");
    } else {
      element.setAttribute("disabled", "true");
    }
  }

  /**
   * Method used to show error toast popup (and underlying error message in console)
   * @param {String} message The message to be displayed in the toast
   */
  static showToastError(message) {
    this.#showToast(this.#TYPE_ERROR, message);
    console.error(message);
  }

  /**
   * Method used to show warning toast popup (and underlying warn message in console)
   * @param {String} message The message to be displayed in the toast
   */
  static showToastWarning(message) {
    this.#showToast(this.#TYPE_WARNING, message);
    console.warn(message);
  }

  /**
   * Method used to show success toast popup (and underlying info message in console)
   * @param {String} message The message to be displayed in the toast
   */
  static showToastSuccess(message) {
    this.#showToast(this.#TYPE_SUCCESS, message);
    console.info(message);
  }

  /**
   * Method used to show error popup of specified type with appropriate message
   * @param {Number} type The type of popup to be displayed
   * @param {String} message The message to be displayed in the toast
   */
  static #showToast(type, message) {
    // create toast content
    const toastContent = document.createElement("div");
    toastContent.classList.add("toast");
    toastContent.classList.add(this.#getToastClass(type));
    toastContent.innerHTML = `${this.#getToastIcon(type)} ${message}`;
    // add toast content to appropriate container
    document.getElementById("toastBox").appendChild(toastContent);
    // remove toast content after predefined time
    setTimeout(() => toastContent.remove(), this.#TOAST_TIMEOUT_MS);
  }

  /**
   * Method used to receive the appropriate toast class name(s) based on its type
   * @param {Number} toastType The type of popup for which we want to get class name(s)
   * @returns string with class name(s) for the specified toast type
   */
  static #getToastClass(toastType) {
    if (this.#TYPE_ERROR === toastType) {
      return "error";
    } else if (this.#TYPE_WARNING === toastType) {
      return "warning";
    } else if (this.#TYPE_SUCCESS === toastType) {
      return "success";
    } else {
      console.error(`Unknown toast type: ${toastType}`);
    }
  }

  /**
   * Method used to receive the appropriate toast icon based on its type
   * @param {Number} toastType The type of popup for which we want to get icon
   * @returns string with icon HTML code for the specified toast type
   */
  static #getToastIcon(toastType) {
    let toastImage = "";
    if (this.#TYPE_ERROR === toastType) {
      toastImage = "fa-times-circle";
    } else if (this.#TYPE_WARNING === toastType) {
      toastImage = "fa-exclamation-circle";
    } else if (this.#TYPE_SUCCESS === toastType) {
      toastImage = "fa-check-circle";
    } else {
      console.error(`Unknown toast type: ${toastType}`);
    }
    return `<i class="fa ${toastImage}"></i>`;
  }
}

import { CommonController } from "./controller-common.js";
import { GroupsService } from "./service-group.js";
import { GroupsView } from "./view-group.js";

export class GroupsController {
  #mediator = undefined;
  #groupColumns = undefined;
  #groupExpanded = undefined;

  /**
   * Creates new groups controller
   */
  constructor() {
    this.#initController();
  }

  /**
   * Method used to emit event from controller to mediator
   * @param {String} eventType The type of event which we want to transmit
   * @param {Object} eventObject The object which we want to transmit
   */
  emitEvent(eventType, eventObject) {
    if (undefined === this.#mediator) {
      CommonController.showToastWarning(`Cannot emit event - mediator is undefined`);
    }
    this.#mediator.notify(this, eventType, eventObject);
  }

  /**
   * Method used to handle event received from mediator
   * @param {String} eventType The type of received event
   * @param {Object} eventObject The received object
   */
  handleEvent(eventType, eventObject) {
    if ("subscribed" === eventType) {
      this.#mediator = eventObject;
    }
    return;
  }

  /**
   * Method used to (re)initialize controller
   */
  #initController() {
    // get all elements representing group columns
    this.#groupColumns = document.querySelectorAll(".group-column > .group-container");
    // initialize style, size, and logic of all group columns
    this.#initStyle();
    this.#initDimensions();
    this.#bindListeners();
  }

  /**
   * Method used to set style for all group columns (position, colors and animation)
   */
  #initStyle() {
    const colors = this.#getAvailableColors();
    const animations = ["column-from-top", "column-from-right", "column-from-bottom", "column-from-left"];
    this.#groupColumns.forEach((column) => {
      if ("update" === column.dataset.action) {
        // get color from array and then remove it so no duplicates are selected (in next iterations)
        column.classList.add(colors.length > 0
            ? "background-" + this.#getRandomElement(colors, true)
            : this.#createColorClass(this.#getRandomColor()));
        // get animation from array (duplicates are allowed in this case)
        column.classList.add(this.#getRandomElement(animations, false));
      } else {
        // new group column should always appear from right and have gray background
        column.classList.add("background-violet");
        column.querySelector(".group-title").classList.add("background-violet");
        column.classList.add("column-from-right");
      }
    });
    // when all styles are ready we can now show columns
    this.#showColumnsContainer();
  }

  /**
   * Method used to initialize column dimensions (positions and size)
   */
  #initDimensions() {
    this.#groupColumns.forEach((column) => this.#setDimension(column));
  }

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: group column and close column buttons clicks & new column hint
   */
  #bindListeners() {
    this.#groupColumns.forEach((column) => {
      column.addEventListener("click", (event) => {
        this.#expand(column);
        event.stopPropagation();
      });
      column.addEventListener("mouseover", (event) => {
        this.#showHint(column);
        event.stopPropagation();
      });
      column.addEventListener("mouseout", (event) => {
        this.#hideHint(column);
        event.stopPropagation();
      });
    });
    const groupCategoryButtons = document.querySelectorAll("input.group-category");
    groupCategoryButtons.forEach((button) => {
      button.addEventListener("click", (clickEvent) => {
        const categoryDialog = document.querySelector("dialog.group-category-dialog");
        categoryDialog.addEventListener("close", (closeEvent) => {
          const parentCategoryButton = this.#groupExpanded.querySelector("input.group-category");
          parentCategoryButton.value = categoryDialog.returnValue;
          closeEvent.stopPropagation();
        }, { once: true });
        categoryDialog.showModal();
        clickEvent.stopPropagation();
      });
    });
    const groupCloseButtons = document.querySelectorAll(".group-buttons > .group-close-btn");
    groupCloseButtons.forEach((closeButton) => {
      closeButton.addEventListener("click", (clickEvent) => {
        const target = clickEvent.currentTarget;
        const selectedAction = target.dataset.action;
        if ("add" === selectedAction) {
          this.#addGroup(closeButton, target.dataset.id);
        } else if ("update" === selectedAction) {
          this.#updateGroup(closeButton, target.dataset.id);
        } else if ("delete" === selectedAction) {
          const confirmDialog = document.querySelector("dialog.delete-group-dialog");
          confirmDialog.addEventListener("close", (closeEvent) => {
            if ("yes" === confirmDialog.returnValue) {
              this.#deleteGroup(closeButton, target.dataset.id);
            }
            closeEvent.stopPropagation();
          }, { once: true });
          confirmDialog.querySelector("label").innerText = `delete group: ${target.dataset.id}?`
          confirmDialog.showModal();
        } else if ("cancel" === selectedAction) {
          this.#collapse(closeButton);
        } else {
          CommonController.showToastError(`Unsupported accept button action: ${selectedAction}`);
        }
        clickEvent.stopPropagation();
      });
    });
  }

  /**
   * Method used to handle new group addition logic
   * @param {Object} closeButton The close button of added group used for collapsing UI
   * @param {String} parentUserId The parent identifier for which we want to add new group
   */
  #addGroup(closeButton, parentUserId) {
    GroupsService.addGroup(parentUserId)
      .then((data) => {
        this.#reloadGroups(parentUserId);
        this.#collapse(closeButton);
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        closeButton.classList.add("shake");
        setTimeout(() => closeButton.classList.remove("shake"), 500);
        CommonController.showToastError(error);
      });
  }

  /**
   * Method used to handle group edition logic
   * @param {Object} closeButton The close button of edited group used for collapsing UI
   * @param {String} editedGroupId The edited group identifier
   */
  #updateGroup(closeButton, editedGroupId) {
    GroupsService.updateGroup(editedGroupId)
      .then((data) => {
        this.#collapse(closeButton);
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        closeButton.classList.add("shake");
        setTimeout(() => closeButton.classList.remove("shake"), 500);
        CommonController.showToastError(error);
      });
  }

  /**
   * Method used to handle group deletion logic
   * @param {Object} closeButton The close button of deleted group used for collapsing UI
   * @param {String} deletedGroupId The deleted group identifier
   */
  #deleteGroup(closeButton, deletedGroupId) {
    GroupsService.deleteGroup(deletedGroupId)
      .then((data) => {
        this.#reloadGroups(0);
        this.#collapse(closeButton);
        CommonController.showToastSuccess(data);
      })
      .catch((error) => {
        closeButton.classList.add("shake");
        setTimeout(() => closeButton.classList.remove("shake"), 500);
        CommonController.showToastError(error);
      });
  }

  /**
   * Method used to reload observers for the specified parent group
   * @param {String} parentGroupId The observers parent group identifier
   */
  #reloadGroups(parentUserId) {
    if (undefined === parentUserId) {
      CommonController.showToastWarning(`Cannot reload groups for ${parentGroupId} user.`);
      return;
    }
    GroupsService.getGroups(parentUserId)
      .then((data) => {
        const userId = data[0].user;
        const userGroups = data[0].groups;
        const groupsContainer = document.querySelector("section.group-columns");
        groupsContainer.innerHTML = GroupsView.getHtml(userId, userGroups);
        this.#initController();
        // notify other controllers that groups were reloaded
        this.emitEvent("groups-reloaded", userId);
      })
      .catch((error) => CommonController.showToastError(error));
  }

  /**
   * Method used to show whole group columns container
   */
  #showColumnsContainer() {
    const columnsStatus = document.querySelector("section.group-status");
    columnsStatus.classList.remove("show");
    columnsStatus.classList.add("hide");
    const columnsContainer = document.querySelector("section.group-columns");
    columnsContainer.classList.remove("hide");
    columnsContainer.classList.add("show");
  }

  /**
   * Method used to expand the selected group column to full available width
   * @param {Object} groupColumn The column which should be expanded
   */
  #expand(groupColumn) {
    if (undefined === this.#groupExpanded) {
      // add group column will always display hint when expading - we must remove it
      if ("add" === groupColumn.dataset.action) {
        groupColumn.parentNode.classList.remove("show-hint");
      }
      // go with regular flow for all columns
      this.#groupColumns.forEach((column) => {
        column.parentNode.classList.add(column === groupColumn ? "expanded" : "collapsed");
        this.#clearDimension(column);
      });
      this.#groupExpanded = groupColumn.parentNode;
      // notify other controllers that group with specified name was expanded
      this.emitEvent("group-expanded", groupColumn.querySelector("h2.group-title").innerText);
    }
  }

  /**
   * Method used to collapse the selected group column to display all available choices/columns
   * @param {Object} groupCloseButton The close button of column which should be collapsed
   */
  #collapse(groupCloseButton) {
    if (undefined !== this.#groupExpanded) {
      this.#groupColumns.forEach((column) => {
        column.parentNode.classList.remove("expanded");
        column.parentNode.classList.remove("collapsed");
        this.#setDimension(column);
      });
      groupCloseButton.classList.remove("show");
      this.#groupExpanded = undefined;
      // notify other controllers that none group is expanded
      this.emitEvent("group-expanded", undefined);
    }
  }

  /**
   * Method used to show column hint (available only for "add" gruop column)
   * @param {Object} column The column for which we want to show a hint
   */
  #showHint(column) {
    // hint is only available for add group column
    if ("add" !== column.dataset.action) {
      return;
    }
    // show hind and clear dimension only when new group is NOT expanded
    if (!column.parentNode.classList.contains("expanded")) {
      column.parentNode.classList.add("show-hint");
      this.#clearDimension(column);
    }
  }

  /**
   * Method used to hide column hint (available only for "add" gruop column)
   * @param {Object} column The column for which we want to hide a hint
   */
  #hideHint(column) {
    // hint is only available for add group column
    if ("add" !== column.dataset.action) {
      return;
    }
    column.parentNode.classList.remove("show-hint");
    // restore dimensions only when new group is NOT expanded
    if (!column.parentNode.classList.contains("expanded")) {
      this.#setDimension(column);
    }
  }

  /**
   * Method used to set the dimensions (position and width) of the specified column
   * @param {Object} column The column which dimensions should be configured
   */
  #setDimension(column) {
    const NEW_GROUP_COLUMN_WIDTH = 4;
    if ("update" === column.dataset.action) {
      const columnWidth = (100 - NEW_GROUP_COLUMN_WIDTH) / (this.#groupColumns.length - 1);
      const columnIndex = Array.from(this.#groupColumns).indexOf(column);
      column.parentNode.style.width = `${columnWidth}%`;
      column.parentNode.style.left = `${columnWidth * columnIndex}vh`;
    } else {
      column.parentNode.style.width = `${NEW_GROUP_COLUMN_WIDTH}%`;
      column.parentNode.style.left = `${100 - NEW_GROUP_COLUMN_WIDTH}vh`;
    }
  }

  /**
   * Method used to clear the dimensions of the selected column
   * @param {Object} column The column which dimensions should be cleared
   */
  #clearDimension(column) {
    column.parentNode.removeAttribute("style");
  }

  /**
   * Method used to receive an array of currently available colors
   * @returns an array with available colors (defined and currently generated)
   */
  #getAvailableColors() {
    const definedColors = ["navy", "aqua", "green", "orange", "red", "blue", "yellow", "plum"];
    const pageHeadElement = document.getElementsByTagName("head")[0];
    const generatedColors = Array.from(pageHeadElement.getElementsByTagName("style")).map((element) => {
      return element.innerHTML.match(".background-([0-9a-fA-F]+)")[1];
    });
    return definedColors.concat(generatedColors);
  }

  /**
   * Method used to create CSS color responsible for color style
   * @param {String} color The color name/code/hex for which we want to generate class
   * @returns the name of currently generated (and added to header) style class
   */
  #createColorClass(color) {
    const className = `background-${color}`;
    const classElement = document.createElement("style");
    classElement.innerHTML = `.${className} { background: #${color}; color: ${this.#contrastColor(color)}; }`;
    document.getElementsByTagName("head")[0].appendChild(classElement);
    return className;
  }

  /**
   * Method used to receive random element from provided array
   * @param {Object} array The array from which we want to receive element
   * @param {Boolean} remove If we want to remove the received random element from array (to prevent duplicates)
   * @returns random element from input array
   */
  #getRandomElement(array, remove) {
    const randomItem = array[Math.floor(Math.random() * array.length)];
    if (remove) {
      var index = array.indexOf(randomItem);
      if (-1 !== index) {
        array.splice(index, 1);
      }
    }
    return randomItem;
  }

  /**
   * Method used to generate and receive random color
   * @returns String with random color in form of a HEX number
   */
  #getRandomColor() {
    return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  }

  /**
   * Method used to generate color with good contrast to the input (black or white)
   * @param {String} color The color in HEX for which we want to generate good contrast color
   * @returns black or white color in HEX which has the better contrast to the input color
   */
  #contrastColor(color) {
    if (0 === color.indexOf("#")) {
      color = color.slice(1);
    }
    if (3 === color.length) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    if (6 !== color.length) {
      CommonController.showToastError(`Cannot generate color. Invalid value: ${color}`)
      return "black";
    }
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "black" : "white";
  }
}

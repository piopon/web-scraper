export class GroupsController {
  #mediator = undefined;
  #groupExpanded = false;
  #groupColumns = undefined;

  /**
   * Creates new groups controller
   */
  constructor() {
    // get all elements representing group columns
    this.#groupColumns = document.querySelectorAll(".group-column > .group-container");
    // initialize style, size, and logic of all group columns
    this.#initStyle();
    this.#initDimensions();
    this.#bindListeners();
  }

  emitEvent(eventType, eventObject) {
    if (undefined === this.#mediator) {
      console.error(`Cannot emit event - mediator is undefined`);
    }
    this.#mediator.notify(this, eventType, eventObject);
  }

  handleEvent(eventType, eventObject) {
    if ("subscribed" === eventType) {
      this.#mediator = eventObject;
    }
    return;
  }

  /**
   * Method used to set style for all group columns (position, colors and animation)
   */
  #initStyle() {
    const colors = ["navy", "aqua", "green", "orange", "red", "blue", "yellow", "plum"];
    const animations = ["column-from-top", "column-from-right", "column-from-bottom", "column-from-left"];
    this.#groupColumns.forEach((column) => {
      if ("update" === column.dataset.action) {
        // get color from array and then remove it so no duplicates are selected (in next iterations)
        const selectedColor = this.#getRandom(colors, true);
        column.classList.add("background-" + selectedColor);
        column.querySelector(".group-title").classList.add("background-" + selectedColor);
        // get animation from array (duplicates are allowed in this case)
        column.classList.add(this.#getRandom(animations, false));
      } else {
        // new group column should always appear from right and have gray background
        column.classList.add("background-violet");
        column.querySelector(".group-title").classList.add("background-violet");
        column.classList.add("column-from-right");
      }
    });
    // when all styles are ready we can now show columns
    this.#showColumnsContainer();
  };

  /**
   * Method used to initialize column dimensions (positions and size)
   */
  #initDimensions() {
    this.#groupColumns.forEach((column) => this.#setDimension(column));
  };

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
    const groupCloseButtons = document.querySelectorAll(".group-buttons > .group-close-btn");
    groupCloseButtons.forEach((closeButton) => {
      closeButton.addEventListener("click", (event) => {
        this.#collapse(closeButton);
        event.stopPropagation();
      });
    });
  };

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
    if (!this.#groupExpanded) {
      // add group column will always display hint when expading - we must remove it
      if ("add" === groupColumn.dataset.action) {
        groupColumn.parentNode.classList.remove("show-hint");
      }
      // go with regular flow for all columns
      this.#groupColumns.forEach((column) => {
        column.parentNode.classList.add(column === groupColumn ? "expanded" : "collapsed");
        this.#clearDimension(column);
      });
      this.#groupExpanded = true;
    }
  };

  /**
   * Method used to collapse the selected group column to display all available choices/columns
   * @param {Object} groupCloseButton The close button of column which should be collapsed
   */
  #collapse(groupCloseButton) {
    if (this.#groupExpanded) {
      this.#groupColumns.forEach((column) => {
        column.parentNode.classList.remove("expanded");
        column.parentNode.classList.remove("collapsed");
        this.#setDimension(column);
      });
      groupCloseButton.classList.remove("show");
      this.#groupExpanded = false;
    }
  };

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
  };

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
  };

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
  };

  /**
   * Method used to clear the dimensions of the selected column
   * @param {Object} column The column which dimensions should be cleared
   */
  #clearDimension(column) {
    column.parentNode.removeAttribute("style");
  };

  /**
   * Method used to receive random element from provided array
   * @param {Object} array The array from which we want to receive element
   * @param {Boolean} remove If we want to remove the received random element from array (to prevent duplicates)
   * @returns random element from input array
   */
  #getRandom(array, remove) {
    const randomItem = array[Math.floor(Math.random() * array.length)];
    if (remove) {
      var index = array.indexOf(randomItem);
      if (index !== -1) {
        array.splice(index, 1);
      }
    }
    return randomItem;
  };
};

export const GroupsController = function () {
  var groupExpanded = false;
  const NEW_GROUP_COLUMN_WIDTH = 4;
  const colors = ["navy", "aqua", "green", "orange", "red", "blue", "yellow", "plum"];
  const animations = ["column-from-top", "column-from-right", "column-from-bottom", "column-from-left"];
  const groupColumns = document.querySelectorAll(".group-column > .group-container");
  const groupCloseButtons = document.querySelectorAll(".group-content > .group-column-close");

  /**
   * Method used to expand the selected group column to full available width
   * @param {Object} groupColumn The column which should be expanded
   */
  const expand = function (groupColumn) {
    if ("add" === groupColumn.dataset.action) {
      hideHint(groupColumn);
    }
    if (!groupExpanded) {
      groupColumns.forEach((column) => {
        column.parentNode.classList.add(column === groupColumn ? "expanded" : "collapsed");
        clearDimension(column);
      });
      groupColumn.querySelector(".group-column-close").classList.add("show");
      groupExpanded = true;
    }
  };

  /**
   * Method used to collapse the selected group column to display all available choices/columns
   * @param {Object} groupCloseButton The close button of column which should be collapsed
   */
  const collapse = function (groupCloseButton) {
    if (groupExpanded) {
      groupColumns.forEach((column) => {
        column.parentNode.classList.remove("expanded");
        column.parentNode.classList.remove("collapsed");
        setDimension(column);
      });
      groupCloseButton.classList.remove("show");
      groupExpanded = false;
    }
  };

  /**
   * Method used to show column hint (available only for "add" gruop column)
   * @param {Object} column The column for which we want to show a hint
   */
  const showHint = function (column) {
    if ("add" !== column.dataset.action) {
      return;
    }
    column.parentNode.classList.add("show-hint");
    column.querySelector("h2").innerHTML = "add group";
    clearDimension(column);
  };

  /**
   * Method used to hide column hint (available only for "add" gruop column)
   * @param {Object} column The column for which we want to hide a hint
   */
  const hideHint = function (column) {
    if ("add" !== column.dataset.action) {
      return;
    }
    column.parentNode.classList.remove("show-hint");
    column.querySelector("h2").innerHTML = "+";
    setDimension(column);
  };

  /**
   * Method used to receive random element from provided array
   * @param {Object} array The array from which we want to receive element
   * @param {Boolean} remove If we want to remove the received random element from array (to prevent duplicates)
   * @returns random element from input array
   */
  const getRandom = function (array, remove) {
    const randomItem = array[Math.floor(Math.random() * array.length)];
    if (remove) {
      var index = array.indexOf(randomItem);
      if (index !== -1) {
        array.splice(index, 1);
      }
    }
    return randomItem;
  };

  /**
   * Method used to set style for all group columns (position, colors and animation)
   */
  const initStyle = function () {
    groupColumns.forEach((column) => {
      if ("update" === column.dataset.action) {
        // get color from array and then remove it so no duplicates are selected (in next iterations)
        const selectedColor = getRandom(colors, true);
        column.classList.add("background-" + selectedColor);
        column.querySelector(".group-title").classList.add("background-" + selectedColor);
        // get animation from array (duplicates are allowed in this case)
        column.classList.add(getRandom(animations, false));
      } else {
        // new group column should always appear from right and have gray background
        column.classList.add("background-violet");
        column.querySelector(".group-title").classList.add("background-violet");
        column.classList.add("column-from-right");
      }
    });
  };

  /**
   * Method used to set the dimensions (position and width) of the specified column
   * @param {Object} column The column which dimensions should be configured
   */
  const setDimension = function (column) {
    if ("update" === column.dataset.action) {
      const columnWidth = (100 - NEW_GROUP_COLUMN_WIDTH) / (groupColumns.length - 1);
      const columnIndex = Array.from(groupColumns).indexOf(column);
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
  const clearDimension = function (column) {
    column.parentNode.removeAttribute("style");
  };

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: group column and close column buttons clicksss
   */
  const bindListeners = function () {
    groupColumns.forEach((column) => {
      column.addEventListener("click", (event) => {
        expand(this);
        event.stopPropagation();
      });
      column.addEventListener("mouseover", (event) => {
        showHint(column);
        event.stopPropagation();
      });
      column.addEventListener("mouseout", (event) => {
        hideHint(column);
        event.stopPropagation();
      });
    });
    groupCloseButtons.forEach((closeButton) => {
      closeButton.addEventListener("click", (event) => {
        collapse(this);
        event.stopPropagation();
      });
    });
  };

  /**
   * Method used to initialize column dimensions (positions and size)
   */
  const initDimensions = function () {
    groupColumns.forEach((column) => setDimension(column));
  };

  /**
   * Method used to setup the column controller
   */
  const setup = function () {
    initStyle();
    initDimensions();
    bindListeners();
  };

  return { initialize: setup };
};

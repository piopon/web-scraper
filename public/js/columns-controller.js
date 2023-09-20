export const ColumnsController = function () {
  const groupColumns = document.querySelectorAll(".group-column > .group-container");
  const groupCloseButtons = document.querySelectorAll(".group-content > .group-column-close");
  var groupExpanded = false;

  /**
   * Method used to expand the selected group column to full available width
   * @param {Object} groupColumn The column which should be expanded
   */
  const expand = function (groupColumn) {
    if (!groupExpanded) {
      groupColumns.forEach((column) => {
        column.parentNode.classList.add(column === groupColumn ? "expanded" : "collapsed");
        clearPosition(column);
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
        setPosition(column);
      });
      groupCloseButton.classList.remove("show");
      groupExpanded = false;
    }
  };

  /**
   * Method used to set style for all group columns (position, colors and animation)
   */
  const setStyle = function () {
    const colors = ["navy", "aqua", "green", "orange", "red", "blue", "yellow", "plum"];
    const animations = ["column-from-top", "column-from-right", "column-from-bottom", "column-from-left"];
    [].forEach.call(groupColumns, function (column) {
      // adjust position of each column
      setPosition(column);
      // get color from array and then remove it so no duplicates are selected (in next iterations)
      const selectedColor = colors[Math.floor(Math.random() * colors.length)];
      var index = colors.indexOf(selectedColor);
      if (index !== -1) {
        colors.splice(index, 1);
      }
      column.classList.add("background-" + selectedColor);
      column.querySelector(".group-title").classList.add("background-" + selectedColor);
      // get animation from array (duplicates are allowed in this case)
      const selectedAnimation = animations[Math.floor(Math.random() * animations.length)];
      column.classList.add(selectedAnimation);
    });
  };

  /**
   * Method used to set the position (and width) of the specified column
   * @param {Object} column The column which position (and width) shoulde be setup
   */
  const setPosition = function (column) {
    const columnWidth = 100 / groupColumns.length;
    const columnIndex = Array.from(groupColumns).indexOf(column);
    column.parentNode.style.width = `${columnWidth}%`;
    column.parentNode.style.left = `${columnWidth * columnIndex}vh`;
  };

  /**
   * Method used to clear the position setting of the selected column
   * @param {Object} column The column which position setting should be cleared
   */
  const clearPosition = function (column) {
    column.parentNode.removeAttribute("style");
  };

  /**
   * Method used to bind listeners to all group columns and column close buttons
   */
  const bindListeners = function () {
    [].forEach.call(groupColumns, function (column) {
      column.addEventListener("click", function (event) {
        expand(this);
        event.stopPropagation();
      });
    });
    [].forEach.call(groupCloseButtons, function (closeButton) {
      closeButton.addEventListener("click", function (event) {
        collapse(this);
        event.stopPropagation();
      });
    });
  };

  /**
   * Method used to setup the column controller (set style, position, create and bind all listeners)
   */
  const setup = function () {
    setStyle();
    bindListeners();
  };

  return { initialize: setup };
};

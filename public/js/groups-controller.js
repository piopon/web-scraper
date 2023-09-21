export const GroupsController = function () {
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
   * Method used to set the dimensions (position and width) of the specified column
   * @param {Object} column The column which dimensions should be configured
   */
  const setDimension = function (column) {
    const columnWidth = 100 / groupColumns.length;
    const columnIndex = Array.from(groupColumns).indexOf(column);
    column.parentNode.style.width = `${columnWidth}%`;
    column.parentNode.style.left = `${columnWidth * columnIndex}vh`;
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
      column.addEventListener("click", function (event) {
        expand(this);
        event.stopPropagation();
      });
    });
    groupCloseButtons.forEach((closeButton) => {
      closeButton.addEventListener("click", function (event) {
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
    initDimensions();
    bindListeners();
  };

  return { initialize: setup };
};

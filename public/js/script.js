const ColumnsController = function () {
  const groupColumns = document.querySelectorAll(".group-column > .group-container");
  const groupCloseButtons = document.querySelectorAll(".group-content > .group-column-close");
  var groupExpanded = false;

  const expand = function (groupColumn) {
    if (!groupExpanded) {
      groupColumns.forEach((column) => {
        column.parentNode.classList.add(column === groupColumn ? "group-column-expanded" : "group-column-collapsed");
        clearPosition(column);
      });
      const groupCloseButton = groupColumn.querySelector(".group-column-close");
      groupCloseButton.classList.add("group-column-close-show");
      groupCloseButton.style.transition = "all .6s 1s cubic-bezier(0.23, 1, 0.32, 1)";
      groupExpanded = true;
    }
  };

  const collapse = function (groupCloseButton) {
    if (groupExpanded) {
      const groupColumn =
        groupCloseButton.parentNode.parentNode.parentNode.parentNode.querySelector(".group-column-expanded");
      groupColumn.classList.remove("group-column-expanded");
      groupColumns.forEach((column) => {
        column.parentNode.classList.remove("group-column-collapsed");
        setPosition(column);
      });
      groupCloseButton.classList.remove("group-column-close-show");
      groupCloseButton.style.transition = "all 0.2s 0s cubic-bezier(0.23, 1, 0.32, 1)";
      groupExpanded = false;
    }
  };

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

  const setPosition = function(column) {
    const columnWidth = 100 / groupColumns.length;
    const columnIndex = Array.from(groupColumns).indexOf(column);
    column.parentNode.style.width = `${columnWidth}%`;
    column.parentNode.style.left = `${columnWidth * columnIndex}vh`;
  }

  const clearPosition = function(column) {
    column.parentNode.removeAttribute("style");
  }

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

  const init = function () {
    setStyle();
    bindListeners();
  };

  return { initialize: init };
};

ColumnsController().initialize();

const observerButtons = document.querySelectorAll("div.modal-button");
const modalAcceptButtons = document.querySelectorAll("div.modal-accept");
const modalCancelButtons = document.querySelectorAll("div.modal-cancel");

[].forEach.call(observerButtons, function (observerButton) {
  observerButton.addEventListener("click", function () {
    const observerDialog = this.parentNode.querySelector("div.modal-dialog");
    observerDialog.classList.remove("out");
    observerDialog.classList.add("in");
  });
});

[].forEach.call(modalAcceptButtons, function (modalAccept) {
  modalAccept.addEventListener("click", function () {
    this.parentNode.parentNode.parentNode.classList.add("out");
  });
});

[].forEach.call(modalCancelButtons, function (modalCancel) {
  modalCancel.addEventListener("click", function () {
    this.parentNode.parentNode.parentNode.classList.add("out");
  });
});

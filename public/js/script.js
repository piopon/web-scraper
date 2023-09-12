const ColumnsController = function () {
  const groupColumns = document.querySelectorAll(".group-column > .group-container");
  const groupCloseButtons = document.querySelectorAll(".group-container > .group-column-close");
  var groupExpanded = false;

  const expand = function (groupColumn) {
    if (!groupExpanded) {
      groupColumn.parentNode.classList.add("group-column-expanded");
      groupColumn.querySelector(".group-content").style.transition = "all .5s .3s cubic-bezier(0.23, 1, 0.32, 1)";
      const groupCloseButton = groupColumn.querySelector(".group-column-close");
      groupCloseButton.classList.add("group-column-close-show");
      groupCloseButton.style.transition = "all .6s 1s cubic-bezier(0.23, 1, 0.32, 1)";
      groupExpanded = true;
    }
  };

  const collapse = function (groupCloseButton) {
    if (groupExpanded) {
      const groupColumn = groupCloseButton.parentNode.parentNode.parentNode.querySelector(".group-column-expanded");
      groupColumn.querySelector(".group-content").style.transition = "all 0.15s 0 cubic-bezier(0.23, 1, 0.32, 1)";
      groupColumn.classList.remove("group-column-expanded");
      groupCloseButton.classList.remove("group-column-close-show");
      groupCloseButton.style.transition = "all 0.2s 0s cubic-bezier(0.23, 1, 0.32, 1)";
      groupExpanded = false;
    }
  };

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

  return { initialize: bindListeners };
};

ColumnsController().initialize();

const button = document.querySelector("div.modal-button");
button.addEventListener("click", function (event) {
  const container = document.querySelector("div.modal-dialog");
  container.classList.remove("out");
  container.classList.add("in");
});

const modalContainer = document.querySelector("div.modal-dialog");
modalContainer.addEventListener("click", function (event) {
  this.classList.add("out");
});

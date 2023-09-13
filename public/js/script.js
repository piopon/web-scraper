const ColumnsController = function () {
  const groupColumns = document.querySelectorAll(".group-column > .group-container");
  const groupCloseButtons = document.querySelectorAll(".group-content > .group-column-close");
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
      const groupColumn = groupCloseButton.parentNode.parentNode.parentNode.parentNode.querySelector(".group-column-expanded");
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

const modalAccept = document.querySelector("div.modal-accept");
modalAccept.addEventListener("click", function () {
  this.parentNode.parentNode.parentNode.classList.add("out");
});

const modalCancel = document.querySelector("div.modal-cancel");
modalCancel.addEventListener("click", function () {
  this.parentNode.parentNode.parentNode.classList.add("out");
});
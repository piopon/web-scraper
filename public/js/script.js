import { ColumnsController } from "./columns-controller.js";

ColumnsController().initialize();

const observerButtons = document.querySelectorAll("div.modal-button");
const modalAcceptButtons = document.querySelectorAll("div.modal-close-btn.accept");
const modalCancelButtons = document.querySelectorAll("div.modal-close-btn.cancel");

observerButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    const observerDialog = this.parentNode.querySelector("div.modal-dialog");
    observerDialog.classList.remove("out");
    observerDialog.classList.add("in");
    event.stopPropagation();
  });
});

modalAcceptButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    this.parentNode.parentNode.parentNode.parentNode.classList.add("out");
    event.stopPropagation();
  });
});

modalCancelButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    this.parentNode.parentNode.parentNode.parentNode.classList.add("out");
    event.stopPropagation();
  });
});

function addObserver() {
  console.log("ADD OBSERVER");
}

function updateObserver(path) {
  console.log(`UPDATE OBSERVER ${path}`);
}
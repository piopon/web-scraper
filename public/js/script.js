import { ColumnsController } from "./columns-controller.js";
import { ColumnsStyler } from "./columns-styler.js";

ColumnsController().initialize();
ColumnsStyler().initialize();

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

export function addObserver() {
  console.log("ADD OBSERVER");
}

export function updateObserver(path) {
  console.log(`UPDATE OBSERVER ${path}`);
}

window.addObserver = addObserver;
window.updateObserver = updateObserver;
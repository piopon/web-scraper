import { ObserversController } from "./observers-controller.js";
import { ColumnsController } from "./columns-controller.js";
import { ColumnsStyler } from "./columns-styler.js";

const observersController = ObserversController();
const columnsController = ColumnsController();
const columnsStyler = ColumnsStyler();

observersController.initialize();
columnsController.initialize();
columnsStyler.initialize();

export function addObserver() {
  console.log("ADD OBSERVER");
}

export function updateObserver(path) {
  console.log(`UPDATE OBSERVER ${path}`);
}

window.addObserver = addObserver;
window.updateObserver = updateObserver;
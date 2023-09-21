import { ObserversController } from "./observers-controller.js";
import { ColumnsController } from "./columns-controller.js";
import { ColumnsStyler } from "./columns-styler.js";

const observersController = ObserversController();
const columnsController = ColumnsController();
const columnsStyler = ColumnsStyler();

observersController.initialize();
columnsController.initialize();
columnsStyler.initialize();

window.addObserver = observersController.add;
window.updateObserver = observersController.update;

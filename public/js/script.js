import { ComponentsController } from "./components-controller.js";
import { ObserversController } from "./observers-controller.js";
import { GroupsController } from "./groups-controller.js";
import { GroupsStyler } from "./groups-styler.js";

const componentsController = ComponentsController();
const observersController = ObserversController();
const groupsController = GroupsController();
const groupsStyler = GroupsStyler();

componentsController.initialize();
observersController.initialize();
groupsController.initialize();
groupsStyler.initialize();

window.addObserver = observersController.add;
window.updateObserver = observersController.update;

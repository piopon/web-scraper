import { ComponentsController } from "./components-controller.js";
import { ObserversController } from "./observers-controller.js";
import { GroupsController } from "./groups-controller.js";

const componentsController = ComponentsController();
const observersController = ObserversController();
const groupsController = GroupsController();

componentsController.initialize();
observersController.initialize();
groupsController.initialize();

window.addObserver = observersController.add;
window.updateObserver = observersController.update;

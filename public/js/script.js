import { ObserversController } from "./observers-controller.js";
import { GroupsController } from "./groups-controller.js";
import { GroupsStyler } from "./groups-styler.js";

const observersController = ObserversController();
const groupsController = GroupsController();
const groupsStyler = GroupsStyler();

observersController.initialize();
groupsController.initialize();
groupsStyler.initialize();

window.addObserver = observersController.add;
window.updateObserver = observersController.update;

import { ComponentsController } from "./components-controller.js";
import { ObserversController } from "./observers-controller.js";
import { GroupsController } from "./groups-controller.js";

const componentsController = ComponentsController();
const observersController = new ObserversController();
const groupsController = GroupsController();

componentsController.initialize();
groupsController.initialize();

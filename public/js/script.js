import { ComponentsController } from "./controller-component.js";
import { ObserversController } from "./controller-observer.js";
import { GroupsController } from "./controller-group.js";

const componentsController = ComponentsController();
const observersController = new ObserversController();
const groupsController = GroupsController();

componentsController.initialize();
groupsController.initialize();

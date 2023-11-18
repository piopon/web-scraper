import { ControllersMediator } from "./controller-mediator.js";
import { ComponentsController } from "./controller-component.js";
import { ObserversController } from "./controller-observer.js";
import { GroupsController } from "./controller-group.js";

// creating mediator class transmitting events between controllers
const mediator = new ControllersMediator();
// creating controllers objects
const componentsController = new ComponentsController();
const observersController = new ObserversController();
const groupsController = new GroupsController();
// registering all controllers in mediator
mediator.register(componentsController);
mediator.register(observersController);
mediator.register(groupsController);
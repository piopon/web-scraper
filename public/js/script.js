import { ControllersMediator } from "./controller-mediator.js";
import { ComponentsController } from "./controller-component.js";
import { ObserversController } from "./controller-observer.js";
import { GroupsController } from "./controller-group.js";

// persist backend variables in frontend local storage at reload
storeInitialBackendValues();
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

function storeInitialBackendValues() {
  const priceAuxComponent = document.querySelector("select.component-price-auxiliary");
  const currenciesOptions = priceAuxComponent.querySelectorAll("option:not([disabled])");
  const currenciesValues = Array.from(currenciesOptions).map((element) => element.value);
  sessionStorage.setItem("currencies", currenciesValues);
}
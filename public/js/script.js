import { ControllersMediator } from "./controller-mediator.js";
import { ComponentsController } from "./controller-component.js";
import { ObserversController } from "./controller-observer.js";
import { GroupsController } from "./controller-group.js";
import { StatusController } from "./controller-status.js";

main();

/**
 * Method used to initialize script
 */
function main() {
  // initialize scrap config and receive JWT only when main index page is opened and if needed
  if (isGroupsInitializationNeeded()) {
    initializeScraperConfig();
    initializeJWT();
  }
  // start current status controller and monitor components
  const statusController = new StatusController();
  statusController.start();
  // add user logout button handler cleaning JWT
  const logoutButton = document.getElementById("user-logout");
  if (logoutButton) {
    logoutButton.addEventListener("submit", () => {
      localStorage.removeItem("JWT");
      return true;
    });
  }
}

/**
 * Method used to check if scrap groups init is needed (happens only when user opened index page)
 * @returns true when root index is opened and initialization is needed, false otherwise
 */
function isGroupsInitializationNeeded() {
  return document.querySelector("section.group-columns") != null;
}

/**
 * Method used to initialize scraper configuration
 */
function initializeScraperConfig() {
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
}

async function initializeJWT() {
  if (localStorage.getItem("JWT")) {
    return;
  }
  const url = `/auth/token`;
  const response = await fetch(url, { method: "GET" });
  if (response.status === 200) {
    const jwt = await response.json();
    localStorage.setItem("JWT", jwt.token);
  }
}

/**
 * Method used to store initial backend values to session storage
 */
function storeInitialBackendValues() {
  const priceAuxComponent = document.querySelector("select.component-price-auxiliary");
  const currenciesOptions = priceAuxComponent.querySelectorAll("option:not([disabled])");
  const currenciesValues = Array.from(currenciesOptions).map((element) => element.value);
  sessionStorage.setItem("currencies", currenciesValues);
}

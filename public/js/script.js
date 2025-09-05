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
  // lock screen orientation before proceeding further
  lockOrientation();
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
  // setup user actions forms (login, register, logout) spinner
  initalizeUserFormsLoaders();
}

/**
 * Method used to lock screen orientation
 */
function lockOrientation() {
  if (window.screen.orientation && window.screen.orientation.lock) {
    const destOrientation = window.matchMedia("(pointer: fine)") ? "landscape-primary" : "portrait-secondary";
    window.screen.orientation
      .lock(destOrientation)
      .then(() => console.log(`Locked '${destOrientation}' orientation.`))
      .catch((error) => console.warn(`Cannot lock '${destOrientation}' orientation: ${error}`));
  } else {
    console.warn("Screen orientation lock is not supported on this device.");
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

/**
 * Method used to initialize JWT and store it in local storage
 */
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
  const dataAuxComponent = document.querySelector("select.component-data-auxiliary");
  if (dataAuxComponent) {
    const extrasOptions = dataAuxComponent.querySelectorAll("option:not([disabled])");
    const extrasValues = Array.from(extrasOptions).map((element) => element.value);
    sessionStorage.setItem("extras", extrasValues);
  } else {
    sessionStorage.removeItem("extras");
  }
}

/**
 * Method used to initialize ALL user-loader forms spinners (visible after submitting data)
 */
function initalizeUserFormsLoaders() {
  document.querySelectorAll("form.user-loader").forEach(function (form) {
    form.addEventListener("submit", function () {
      const spinnerHtml = '<div class="user-spinner loading"></div>';
      const button = form.querySelector('[type="submit"],button:not([type="button"])');
      if (button == null) {
        return;
      }
      button.disabled = true;
      button.innerHTML = spinnerHtml;
    });
  });
}

import { StatusService } from "./service-status.js";

export class StatusController {
  static #MONITOR_INVERVAL_MS = 5000;

  #componentsStatus = undefined;
  #monitorId = undefined;

  /**
   * Creates new status controller
   */
  constructor() {
    this.#initController();
  }

  /**
   * Method used to start status controller monitoring process
   */
  start() {
    this.#updateStatusIcons();
    this.#monitorId = setInterval(() => {
      this.#updateStatusIcons();
    }, StatusController.#MONITOR_INVERVAL_MS);
  }

  /**
   * Method used to stop status controller monitoring process
   */
  stop() {
    clearInterval(this.#monitorId);
  }

  /**
   * Method used to (re)initialize controller
   */
  #initController() {
    this.#initLogTable();
    this.#bindListeners();
  }

  /**
   * Method used to initialize the log table with backend data
   */
  async #initLogTable(componentName = "") {
    const logsTableBody = document.querySelector("#table-logs tbody");
    if (logsTableBody != null) {
      let tableContent = "";
      this.#componentsStatus = await StatusService.getStatus("", true);
      this.#componentsStatus.flatMap(component => this.#createLogObject(component))
                      .sort(this.#sortLogObject)
                      .filter(logObj => this.#filterLogObject(logObj, componentName))
                      .forEach(logObj => tableContent += this.#addLogRow(logObj));
      logsTableBody.innerHTML = tableContent;
    }
  }

  /**
   * Method used to bind UI listeners to controller methods.
   * This method handles: status preview bottom bar
   */
  #bindListeners() {
    const dashboard = document.querySelector("footer#main-footer i#show-dashboard");
    const statusDiv = document.querySelector("footer#main-footer div#status-preview");
    statusDiv.addEventListener("mouseover", () => {
      statusDiv.classList.remove("collapsed");
      statusDiv.classList.add(dashboard != null ? "expanded" : "preview");
    });
    statusDiv.addEventListener("mouseout", () => {
      statusDiv.classList.remove(dashboard != null ? "expanded" : "preview");
      statusDiv.classList.add("collapsed");
    })
  }

  /**
   * Method used to create log object from status component
   * @param {Object} statusComponent The component from which we need to create log object
   * @returns created log object containing all fields to fill log table
   */
  #createLogObject(statusComponent) {
    return statusComponent.history.map(h => {
      return {
        name: statusComponent.name,
        timestamp: h.timestamp,
        type: h.type,
        message: h.message,
      };
    });
  }

  /**
   * Method used to sort log objects via timestamp value
   * @param {Object} logObjectA The first log object to compare
   * @param {Object} logObjectB The second log object to compare
   * @returns negative value when first object is larger, positive when smaller, zero if equal
   */
  #sortLogObject(logObjectA, logObjectB) {
    return Date.parse(logObjectA.timestamp) - Date.parse(logObjectB.timestamp);
  }

  #filterLogObject(logObject, componentName = "") {
    return "" === componentName || "all" === componentName ? true : logObject.name === componentName;
  }

  /**
   * Method used to add HTML code for log row data
   * @param {Object} logObject The data object for which we want to create table row
   * @returns HTML code with log row
   */
  #addLogRow(logObject) {
    return `<tr>
              <td>${logObject.timestamp}</td>
              <td>${logObject.name}</td>
              <td>${logObject.type.toUpperCase()}</td>
              <td>${logObject.message}</td>
            </tr>`;
  }

  /**
   * Method used to update monitor status icons style
   */
  async #updateStatusIcons() {
    try {
      const componentsStatus = await StatusService.getStatus();
      for (const component of componentsStatus) {
        this.#setStatusStyle(component.name.trim(), component.status);
      }
    } catch (error) {
      this.stop();
      console.warn("Cannot get status data. Monitor stopped.");
      // update all components icon to indicate that server is down
      this.#setStatusStyle("web-server", "stopped");
      this.#setStatusStyle("web-scraper", "unknown");
      this.#setStatusStyle("web-database", "unknown");
    }
  }

  /**
   * Method used to set status icon for specified component
   * @param {String} componentName The component name which we want to set
   * @param {String} status The status of the icon to be set
   */
  #setStatusStyle(componentName, status) {
    const icon = document.querySelector(`footer#main-footer i#status-${componentName.trim()}`);
    if (icon == null) {
      return;
    }
    if ("stopped" === status) {
      icon.classList.add("status-stopped");
      icon.title = `${componentName}: stopped`;
      return;
    } else {
      icon.classList.remove("status-stopped");
    }
    if ("initializing" === status) {
      icon.classList.add("status-initializing");
      icon.title = `${componentName}: initializing`;
      return;
    } else {
      icon.classList.remove("status-initializing");
    }
    if ("running" === status) {
      icon.classList.add("status-running");
      icon.title = `${componentName}: running`;
      return;
    } else {
      icon.classList.remove("status-running");
    }
    // no style was set upon this point - set title to status parameter
    icon.title = `${componentName}: ${status}`;
  }
}

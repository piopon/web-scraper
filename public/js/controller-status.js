import { StatusService } from "./service-status.js";

export class StatusController {
  static #MONITOR_INVERVAL_MS = 5000;

  #monitorId = undefined;

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
    this.#initLogList();
    this.#bindListeners();
  }

  /**
   * Method used to (re)initialize controller
   */
  async #initLogList() {
    const logsTableBody = document.querySelector("table#table-logs tbody");
    if (logsTableBody != null) {
      let tableHtml = "";
      const componentsStatus = await StatusService.getStatus("", true);
      componentsStatus.flatMap(component => component.history)
                      .sort((objA, objB) => Date.parse(objA.timestamp) - Date.parse(objB.timestamp))
                      .forEach(data => tableHtml += this.#addLogRow(data));
      logsTableBody.innerHtml = tableHtml;
    }
  }

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

  #addLogRow(logData) {
    return `<tr>
              <td>${logData.timestamp}</td>
              <td>web-components</td>
              <td>${logData.type}</td>
              <td>${logData.message}</td>
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

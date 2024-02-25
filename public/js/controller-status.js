import { StatusService } from "./service-status.js";

export class StatusController {
  static #MONITOR_INVERVAL_MS = 5000;

  #monitorId = undefined;

  constructor() {
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
      this.#setStatusStyle("web-scraper", "offline");
      this.#setStatusStyle("web-database", "offline");
    }
  }

  /**
   * Method used to set status icon for specified component
   * @param {Object} componentIcon The component icon which we want to set
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
    } else {
      icon.classList.remove("status-stopped");
    }
    if ("initializing" === status) {
      icon.classList.add("status-initializing");
      icon.title = `${componentName}: initializing`;
    } else {
      icon.classList.remove("status-initializing");
    }
    if ("running" === status) {
      icon.classList.add("status-running");
      icon.title = `${componentName}: running`;
    } else {
      icon.classList.remove("status-running");
    }
  }
}

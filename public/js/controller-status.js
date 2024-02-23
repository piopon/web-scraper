import { StatusService } from "./service-status.js";

export class StatusController {
  static #MONITOR_INVERVAL_MS = 5000;

  #monitorId = undefined;

  /**
   * Method used to start status controller monitoring process
   */
  start() {
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
        this.#setStatusStyle(
          document.querySelector(`footer#main-footer i#status-${component.name.trim()}`),
          component.status
        );
      }
    } catch (error) {
      this.stop();
      console.warn("Cannot get status data. Monitor stopped.");
      // update all components icon to indicate that server is down
      this.#setStatusStyle(document.querySelector(`footer#main-footer i#status-web-server`), "stopped");
      this.#setStatusStyle(document.querySelector(`footer#main-footer i#status-web-scraper`), "offline");
      this.#setStatusStyle(document.querySelector(`footer#main-footer i#status-web-database`), "offline");
    }
  }

  /**
   * Method used to set status icon for specified component
   * @param {Object} componentIcon The component icon which we want to set
   * @param {String} status The status of the icon to be set
   */
  #setStatusStyle(componentIcon, status) {
    if (componentIcon == null) {
      return;
    }
    if ("stopped" === status) {
      componentIcon.classList.add("status-stopped");
    } else {
      componentIcon.classList.remove("status-stopped");
    }
    if ("initializing" === status) {
      componentIcon.classList.add("status-initializing");
    } else {
      componentIcon.classList.remove("status-initializing");
    }
    if ("running" === status) {
      componentIcon.classList.add("status-running");
    } else {
      componentIcon.classList.remove("status-running");
    }
  }
}

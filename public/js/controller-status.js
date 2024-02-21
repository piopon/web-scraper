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

  async #updateStatusIcons() {
    try {
      const componentsStatus = await StatusService.getStatus();
      for (const component of componentsStatus) {
        const componentIcon = document.querySelector(`footer#main-footer i#status-${component.name.trim()}`);
        this.#setStatusStyle(componentIcon, component.status);
      }
    } catch (error) {
      console.warn("Cannot get status data. Stopping monitor...")
      this.stop();
    }
  }

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

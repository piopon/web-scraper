import { StatusService } from "./service-status.js";

export class StatusController {
  static #MONITOR_INVERVAL_MS = 1000;

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
        switch (component.status) {
          case "stopped":
            componentIcon.classList.add("status-stopped");
            componentIcon.classList.remove("status-initializing");
            componentIcon.classList.remove("status-running");
            break;
          case "initializing":
            componentIcon.classList.remove("status-stopped");
            componentIcon.classList.add("status-initializing");
            componentIcon.classList.remove("status-running");
            break;
          case "running":
            componentIcon.classList.remove("status-stopped");
            componentIcon.classList.remove("status-initializing");
            componentIcon.classList.add("status-running");
            break;
          default:
            componentIcon.classList.remove("status-stopped");
            componentIcon.classList.remove("status-initializing");
            componentIcon.classList.remove("status-running");
            break;
        }
      }
    } catch (error) {
      console.logc("Cannot receive status data.")
    }
  }
}

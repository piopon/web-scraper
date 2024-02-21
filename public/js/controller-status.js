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
    const componentsStatus = await StatusService.getStatus();
    for (const component of componentsStatus) {
      const currName = component.name.trim() === "web-database" ? "db" : "scraper";
      const componentIcon = document.querySelector(`footer#main-footer i#status-${currName}`);
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
  }
}

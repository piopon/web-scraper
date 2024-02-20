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
    document.querySelector("i#status-db").classList.toggle("status-init");
    document.querySelector("i#status-db").classList.toggle("status-run");
    document.querySelector("i#status-scraper").classList.toggle("status-init");
    document.querySelector("i#status-scraper").classList.toggle("status-stop");
  }
}

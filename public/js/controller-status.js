import { StatusService } from "./service-status.js";

export class StatusController {
  static #MONITOR_INVERVAL_MS = 1000;

  #monitorId = undefined;

  start() {
    this.#monitorId = setInterval(() => {
      this.#updateStatusIcons();
    }, StatusController.#MONITOR_INVERVAL_MS);
  }

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

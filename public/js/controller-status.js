export class StatusController {
  static #MONITOR_INVERVAL_MS = 1000;

  #monitorId = undefined;

  start() {
    this.#monitorId = setInterval(() => {
      console.log("monitor id");
    }, StatusController.#MONITOR_INVERVAL_MS);
  }

  stop() {
    clearInterval(this.#monitorId);
  }
}

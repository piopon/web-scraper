export class StatusController {
  #monitorId = undefined;

  start() {
    this.#monitorId = setInterval(() => {
      console.log("monitor id");
    }, 3000);
  }

  stop() {
    clearInterval(this.#monitorId);
  }
}

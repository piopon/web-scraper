import moment from 'moment';

export class StatusLogger {
  #status = [];
  #name = undefined;

  constructor(name) {
    this.#name = name;
    this.log("Started");
  }

  log(message) {
    const dateTimeNow = moment().format("YYYY-MM-DD HH:mm:ss");
    this.#status.push({ timestamp: dateTimeNow, type: "info", message: message });
    console.log(`${dateTimeNow} [${this.#name}] INFO: ${message}`);
  }

  warning(message) {
    const dateTimeNow = moment().format("YYYY-MM-DD HH:mm:ss");
    this.#status.push({ timestamp: dateTimeNow, type: "warning", message: message });
    console.warn(`${dateTimeNow} [${this.#name}] WARNING: ${message}`);
  }

  error(message) {
    const dateTimeNow = moment().format("YYYY-MM-DD HH:mm:ss");
    this.#status.push({ timestamp: dateTimeNow, type: "error", message: message });
    console.error(`${dateTimeNow} [${this.#name}] ERROR: ${message}`);
  }

  getStatus() {
    return this.#status.slice(-1);
  }

  getHistory() {
    return JSON.stringify(this.#status, null, 2);
  }
}

export class StatusLogger {
  #status = [];
  #name = undefined;

  constructor(name) {
    this.#name = name;
    this.log("Started");
  }

  log(message) {
    this.#status.push({ type: "info", message: message });
    console.log(`[${this.#name}] INFO: ${message}`);
  }

  warning(message) {
    this.#status.push({ type: "warning", message: message });
    console.warn(`[${this.#name}] WARNING: ${message}`);
  }

  error(message) {
    this.#status.push({ type: "error", message: message });
    console.error(`[${this.#name}] ERROR: ${message}`);
  }

  getStatus() {
    return this.#status.slice(-1);
  }

  getHistory() {
    return JSON.stringify(this.#status, null, 2);
  }
}

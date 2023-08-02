export class StatusLogger {
  #status = [];

  constructor(initialLogMessage) {
    if (initialLogMessage) {
      this.log(initialLogMessage);
    }
  }

  log(message) {
    this.#status.push({ type: "info", message: message });
    console.log(`INFO: ${message}`);
  }

  warning(message) {
    this.#status.push({ type: "warning", message: message });
    console.warn(`WARNING: ${message}`);
  }

  error(message) {
    this.#status.push({ type: "error", message: message });
    console.error(`ERROR: ${message}`);
  }

  getStatus() {
    return this.#status.slice(-1);
  }
}

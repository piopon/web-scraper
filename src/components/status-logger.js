export class StatusLogger {
  #status = [];

  constructor(initialMessage) {
    if (initialMessage) {
      this.#status.push(initialMessage);
    }
  }
}

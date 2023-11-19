import { AppVariables } from "../../config/app-variables.js";
import moment from "moment";

export class StatusLogger {
  #status = [];
  #name = undefined;
  #minLogLevel = undefined;

  /**
   * Creates a new status logger with specified name
   * @param {String} name The name of the logger
   * @param {Number} minLogLevel The minimal messages level to be logged
   */
  constructor(name, minLogLevel) {
    this.#name = name;
    this.#minLogLevel = minLogLevel;
  }

  /**
   * Method used to return current status logger name
   * @returns name of the logger
   */
  getName() {
    return this.#name;
  }

  /**
   * Adds and prints an info log message
   * @param {String} message The message to add and print
   */
  log(message) {
    const dateTimeNow = moment().format("YYYY-MM-DD HH:mm:ss");
    this.#status.push({ timestamp: dateTimeNow, type: "info", message: message });
    console.log(`${dateTimeNow} [${this.#name}] INFO: ${message}`);
  }

  /**
   * Adds and prints a warning log message
   * @param {String} message The message to add and print
   */
  warning(message) {
    const dateTimeNow = moment().format("YYYY-MM-DD HH:mm:ss");
    this.#status.push({ timestamp: dateTimeNow, type: "warning", message: message });
    console.warn(`${dateTimeNow} [${this.#name}] WARNING: ${message}`);
  }

  /**
   * Adds and prints an error log message
   * @param {String} message The message to add and print
   */
  error(message) {
    const dateTimeNow = moment().format("YYYY-MM-DD HH:mm:ss");
    this.#status.push({ timestamp: dateTimeNow, type: "error", message: message });
    console.error(`${dateTimeNow} [${this.#name}] ERROR: ${message}`);
  }

  /**
   * Method used to get the last logged status
   * @returns an object with last logged status
   */
  getStatus() {
    const lastStatus = this.#status.slice(-1);
    if (lastStatus.length >= 0) {
      return lastStatus[0];
    }
    const dateTimeNow = moment().format("YYYY-MM-DD HH:mm:ss");
    return { timestamp: dateTimeNow, type: "", message: "No status logged yet" };
  }

  /**
   * Method used to receive the whole log history
   * @returns a string with JSON content containing full logs history
   */
  getHistory() {
    return this.#status;
  }
}

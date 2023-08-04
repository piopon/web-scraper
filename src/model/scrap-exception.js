export class ScrapError extends Error {
  /**
   * Creates a new model error class indicating invalid required field values
   * @param {String} message Input message of the error
   */
  constructor(message) {
    super(message);
    this.name = "ScrapError";
  }
}

export class ScrapWarning extends Error {
  /**
   * Creates a new model warning class indicating empty  field value (not required)
   * @param {Object} message Input message of the warning
   */
  constructor(message) {
    super(message);
    this.name = "ScrapWarning";
  }
}

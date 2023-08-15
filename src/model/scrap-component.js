import { ModelUtils } from "../utils/model-utils.js";

export class ScrapComponent {
  /**
   * Creates a new scrap component from a specified object
   * @param {Object} object The source object
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.interval = ModelUtils.getValueOrDefault(input.interval, "");
    this.selector = ModelUtils.getValueOrDefault(input.selector, "");
    this.attribute = ModelUtils.getValueOrDefault(input.attribute, "");
    this.auxiliary = ModelUtils.getValueOrDefault(input.auxiliary, "");
  }

  /**
   * Method used to check correctness of the scrap group values
   * @returns check result containing all errors and warnings
   */
  checkValues() {
    const checkResult = { errors: [], warnings: [] };
    if ((!this.selector || !this.attribute) && !this.auxiliary) {
      checkResult.warnings.push(`Empty title 'selector'/'attribute' and 'auxiliary'`);
    }
    return checkResult;
  }

  /**
   * Method used to retrieve JSON schema
   * @returns JSON schema object
   */
  static getSchema() {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        interval: { type: "string" },
        selector: { type: "string" },
        attribute: { type: "string" },
        auxiliary: { type: "string" },
      },
      required: ["selector", "attribute", "auxiliary"],
    };
  }

  /**
   * Method used to retrieve accepted query params object
   * @param {String} method The request method type to get accepted query params
   * @returns accepted query parameters object
   */
  static getQueryParams(method) {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        source: { enum: ["title", "image", "price"] },
        interval: { type: "string", minLength: 1 },
        attribute: { type: "string", minLength: 1 },
        auxiliary: { type: "string", minLength: 1 },
      },
    };
  }
}

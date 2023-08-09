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
}

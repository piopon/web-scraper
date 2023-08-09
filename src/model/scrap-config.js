import { ModelUtils } from "../utils/model-utils.js";
import { ScrapGroup } from "./scrap-group.js";

export class ScrapConfig {
  /**
   * Creates a new scrap config from a specified object
   * @param {Object} object The source object
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.user = ModelUtils.getValueOrDefault(input.user, "");
    this.groups = ModelUtils.getArrayOfModels(ScrapGroup, input.groups);
  }

  static getSchema() {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        user: { type: "integer", minimum: 0 },
        groups: { type: "array", items: ScrapGroup.getSchema() },
      },
      required: ["user"],
    };
  }
}

import { ModelUtils } from "../utils/model-utils.js";
import { ScrapObserver } from "./scrap-observer.js";

export class ScrapGroup {
  /**
   * Creates a new scrap group from a specified object
   * @param {Object} object The source object
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.name = ModelUtils.getValueOrDefault(input.name, "");
    this.category = ModelUtils.getValueOrDefault(input.category, "");
    this.domain = ModelUtils.getValueOrDefault(input.domain, "");
    this.observers = ModelUtils.getArrayOfModels(ScrapObserver, input.observers);
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
        name: { type: "string", minLength: 1 },
        category: { type: "string", minLength: 1 },
        domain: { type: "string", minLength: 1 },
        observers: { type: "array", items: ScrapObserver.getSchema(), minItems: 1 },
      },
      required: ["domain", "observers"],
    };
  }

  /**
   * Method used to retrieve accepted query params object
   * @returns accepted query parameters object
   */
  static getQueryParams(method) {
    return {
      name: { type: "string", minLength: 1 },
      category: { type: "string", minLength: 1 },
      domain: { type: "string", minLength: 1 },
    };
  }
}

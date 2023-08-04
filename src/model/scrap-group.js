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
}

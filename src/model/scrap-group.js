import { ModelUtils } from "../utils/model-utils.js";
import { ScrapError, ScrapWarning } from "./scrap-exception.js";
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
    // check values only when object was passed (we use empty constructor call to get keys)
    if (object) {
      // domain is needed so the scraper will know the page URL to scan
      if (!this.domain) {
        throw new ScrapError(`Missing required group domain`);
      }
      // check the name and category values against the best experience (non-essential but nice-to-have)
      if (!this.name) {
        throw new ScrapWarning(`Empty group name`);
      }
      if (!this.category) {
        throw new ScrapWarning(`Empty group category`);
      }
    }
  }
}

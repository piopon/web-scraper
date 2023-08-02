import { ModelUtils } from "../utils/model-utils.js";
import { ScrapObserver } from "./scrap-observer.js";

export class ScrapGroup {
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
        throw Error(`Missing group domain`);
      }
    }
  }
}

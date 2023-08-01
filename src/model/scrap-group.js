import { ScrapObserver } from "./scrap-observer.js";
import { getArrayOfModels } from "../components/model-utils.js";

export class ScrapGroup {
  constructor(object) {
    const input = object != null ? object : {};
    this.name = input.name != null ? input.name : "";
    this.category = input.category != null ? input.category : "";
    this.domain = input.domain != null ? input.domain : "";
    this.observers = getArrayOfModels(ScrapObserver, input.observers);
    // check values only when object was passed (we use empty constructor call to get keys)
    if (object) {
      // domain is needed so the scraper will know the page URL to scan
      if (!this.domain) {
        throw Error(`Missing group domain`);
      }
    }
  }
}

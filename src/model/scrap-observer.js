import { ScrapComponent } from "./scrap-component.js";

export class ScrapObserver {
  constructor(object) {
    const input = object != null ? object : {};
    this.path = input.path != null ? input.path : "";
    this.history = input.history != null ? input.history : "";
    this.container = input.container != null ? input.container : "";
    this.title = new ScrapComponent(input.title);
    this.image = new ScrapComponent(input.image);
    this.price = new ScrapComponent(input.price);
    // check values only when object was passed (we use empty constructor call to get keys)
    if (object) {
      // path is needed so the scraper will know the exact page to scan
      if (!this.path) {
        throw Error(`Missing observer path`);
      }
      // all the price settings are essential (after all we want to get price information)
      if (!this.price.selector) {
        throw Error(`Missing 'price.selector' in observer ${object.path}`);
      }
      if (!this.price.attribute) {
        throw Error(`Missing 'price.attribute' in observer ${object.path}`);
      }
      if (!this.price.auxiliary) {
        throw Error(`Missing 'price.auxiliary' in observer ${object.path}`);
      }
    }
  }
}

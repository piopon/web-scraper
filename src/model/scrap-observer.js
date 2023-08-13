import { ModelUtils } from "../utils/model-utils.js";
import { ScrapComponent } from "./scrap-component.js";

export class ScrapObserver {
  /**
   * Creates a new scrap observer from a specified object
   * @param {Object} object The source object
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.path = ModelUtils.getValueOrDefault(input.path, "");
    this.target = ModelUtils.getValueOrDefault(input.target, "load");
    this.history = ModelUtils.getValueOrDefault(input.history, "off");
    this.container = ModelUtils.getValueOrDefault(input.container, "");
    this.title = new ScrapComponent(input.title);
    this.image = new ScrapComponent(input.image);
    this.price = new ScrapComponent(input.price);
  }

  static getSchema() {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        path: { type: "string", minLength: 1 },
        target: { enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"] },
        history: { enum: ["off", "live", "change"] },
        container: { type: "string" },
        title: ScrapComponent.getSchema(),
        image: ScrapComponent.getSchema(),
        price: ScrapComponent.getSchema(),
      },
      required: ["path", "price"],
    };
  }
}

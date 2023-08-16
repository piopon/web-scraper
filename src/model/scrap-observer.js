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

  /**
   * Method used to check correctness of the scrap observer values
   * @returns check result containing all errors and warnings
   */
  checkValues() {
    const checkResult = { errors: [], warnings: [] };
    if (!this.path) {
      checkResult.errors.push(`Missing required observer path`);
    }
    if (!this.price.selector) {
      checkResult.errors.push(`Missing required 'price.selector' in observer ${this.path}`);
    }
    if (!this.price.attribute) {
      checkResult.errors.push(`Missing required 'price.attribute' in observer ${this.path}`);
    }
    if (!this.price.auxiliary) {
      checkResult.errors.push(`Missing required 'price.auxiliary' in observer ${this.path}`);
    }
    if ((!this.title.selector || !this.title.attribute) && !this.title.auxiliary) {
      checkResult.warnings.push(`Empty title 'selector'/'attribute' and 'auxiliary' in observer ${this.path}`);
    }
    if ((!this.image.selector || !this.image.attribute) && !this.image.auxiliary) {
      checkResult.warnings.push(`Empty image 'selector'/'attribute' and 'auxiliary' in observer ${this.path}`);
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

  /**
   * Method used to retrieve accepted query params object
   * @param {String} method The request method type to get accepted query params
   * @returns accepted query parameters object
   */
  static getQueryParams(method) {
    if ("GET" === method) {
      return {
        type: "object",
        additionalProperties: false,
        properties: {
          path: { type: "string", minLength: 1 },
          target: { enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"] },
          history: { enum: ["off", "live", "change"] },
        },
      };
    } else {
      return {
        type: "object",
        additionalProperties: false,
        properties: {
          parent: { type: "string", minLength: 1 },
        },
        required: ["parent"],
      };
    }
  }
}

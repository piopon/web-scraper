import { ModelUtils } from "../utils/model-utils.js";
import { ScrapError } from "./scrap-exception.js";
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
   * Method used to receive the appropriate identifier of group
   * @returns group identifier: string composed of title with domain field value
   */
  getIdentifier() {
    return `domain = ${this.domain}`;
  }

  /**
   * Method used to perform a deep copy of all values in scrap group object
   * @param {Object} otherGroup The scrap group object with source values
   */
  copyValues(otherGroup) {
    if (!ModelUtils.isInstanceOf(ScrapGroup, otherGroup)) {
      throw new ScrapError("Cannot copy scrap group values: incompatible object")
    }
    this.name = otherGroup.name;
    this.category = otherGroup.category;
    this.domain = otherGroup.domain;
    this.observers.forEach((observer, index) => observer.copyValues(otherGroup.observers[index]));
  }

  /**
   * Method used to check correctness of the scrap group values
   * @returns check result containing all errors and warnings
   */
  checkValues() {
    const checkResult = { errors: [], warnings: [] };
    if (!this.domain) {
      checkResult.errors.push("Missing required group domain");
    }
    if (this.observers.length < 1) {
      checkResult.errors.push("At least one observer is needed");
    }
    for (let observerNo = 0; observerNo < this.observers.length; observerNo++) {
      const observerCheckResult = this.observers[observerNo].checkValues();
      checkResult.errors.push(...observerCheckResult.errors);
      checkResult.warnings.push(...observerCheckResult.warnings);
    }
    if (!this.name) {
      checkResult.warnings.push("Empty group name");
    }
    if (!this.category) {
      checkResult.warnings.push("Empty group category");
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
   * @param {String} method The request method type to get accepted query params
   * @returns accepted query parameters object
   */
  static getQueryParams(method) {
    if ("GET" === method) {
      return {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1 },
          category: { type: "string", minLength: 1 },
          domain: { type: "string", minLength: 1 },
        },
      };
    } else if ("POST" === method) {
      return {
        type: "object",
        additionalProperties: false,
        properties: {
          parent: { type: "integer", minimum: 0 },
        },
        required: ["parent"],
      };
    } else {
      return {
        type: "object",
        additionalProperties: false,
        properties: {
          domain: { type: "string", minLength: 1 },
        },
        required: ["domain"],
      };
    }
  }
}

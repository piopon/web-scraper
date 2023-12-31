import { ModelUtils } from "../utils/model-utils.js";
import { ScrapError } from "./scrap-exception.js";
import { ScrapObserver } from "./scrap-observer.js";

export class ScrapGroup {
  static #NAME_REGEX = /[a-zA-Z]/;

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
    return `name = ${this.name}`;
  }

  /**
   * Method used to perform a deep copy of all values in scrap group object
   * @param {Object} otherGroup The scrap group object with source values
   */
  copyValues(otherGroup) {
    if (!ModelUtils.isInstanceOf(ScrapGroup, otherGroup)) {
      throw new ScrapError("Cannot copy scrap group values: incompatible object");
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
    if (!this.name) {
      checkResult.errors.push("Missing required group name");
    } else if (false === ScrapGroup.#NAME_REGEX.test(this.name)) {
      checkResult.errors.push("Group name must have at least one letter");
    }
    if (!this.domain) {
      checkResult.errors.push("Missing required group domain");
    }
    if (this.observers.length < 1) {
      checkResult.warnings.push("Add at least one observer to make things work properly");
    }
    for (let observerNo = 0; observerNo < this.observers.length; observerNo++) {
      const observerCheckResult = this.observers[observerNo].checkValues();
      checkResult.errors.push(...observerCheckResult.errors);
      checkResult.warnings.push(...observerCheckResult.warnings);
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
        observers: { type: "array", items: ScrapObserver.getSchema() },
      },
      required: ["name", "domain", "observers"],
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
          name: { type: "string", minLength: 1 },
        },
        required: ["name"],
      };
    }
  }
}

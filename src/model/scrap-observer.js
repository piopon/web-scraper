import { ModelUtils } from "../utils/model-utils.js";
import { ScrapComponent } from "./scrap-component.js";
import { ScrapError } from "./scrap-exception.js";

import mongoose from "mongoose";

export class ScrapObserver {
  static #NAME_REGEX = /[a-zA-Z]/;
  static #TARGET_OPTIONS = ["load", "domcontentloaded", "networkidle0", "networkidle2"];
  static #HISTORY_OPTIONS = ["off", "on", "onChange"];

  /**
   * Creates a new scrap observer from a specified object
   * @param {Object} object The source object
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.name = ModelUtils.getValueOrDefault(input.name, "");
    this.path = ModelUtils.getValueOrDefault(input.path, "");
    this.target = ModelUtils.getValueOrDefault(input.target, "load");
    this.history = ModelUtils.getValueOrDefault(input.history, "off");
    this.container = ModelUtils.getValueOrDefault(input.container, "");
    this.title = new ScrapComponent(input.title);
    this.image = new ScrapComponent(input.image);
    this.data = new ScrapComponent(input.data);
  }

  /**
   * Method used to receive the appropriate identifier of observer
   * @returns observer identifier: string composed of title with path field value
   */
  getIdentifier() {
    return ScrapObserver.#parseIdentifier(this);
  }

  /**
   * Method used to check correctness of the scrap observer values
   * @returns check result containing all errors and warnings
   */
  checkValues() {
    const checkResult = { errors: [], warnings: [] };
    if (!this.name) {
      checkResult.errors.push(`Missing required observer name`);
    } else if (false === ScrapObserver.#NAME_REGEX.test(this.name)) {
      checkResult.errors.push("Observer name must have at least one letter");
    }
    if (!this.path) {
      checkResult.errors.push(`Missing required observer path`);
    }
    if (!this.data.selector) {
      checkResult.errors.push(`Missing required 'data.selector' in observer ${this.path}`);
    }
    if (!this.data.attribute) {
      checkResult.errors.push(`Missing required 'data.attribute' in observer ${this.path}`);
    }
    if (!this.data.auxiliary) {
      checkResult.errors.push(`Missing required 'data.auxiliary' in observer ${this.path}`);
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
   * Method used to retrieve JSON schema used for validating request body
   * @returns request body JSON schema object
   */
  static getRequestBodySchema() {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string", minLength: 1 },
        path: { type: "string", minLength: 1 },
        target: { enum: ScrapObserver.#TARGET_OPTIONS },
        history: { enum: ScrapObserver.#HISTORY_OPTIONS },
        container: { type: "string" },
        title: ScrapComponent.getRequestBodySchema(),
        image: ScrapComponent.getRequestBodySchema(),
        data: ScrapComponent.getRequestBodySchema(),
      },
      required: ["name", "path", "data"],
    };
  }

  /**
   * Method used to retrieve JSON schema used for validating request query params
   * @param {String} method The request method type to get accepted query params
   * @returns query parameters JSON schema object
   */
  static getRequestParamsSchema(method) {
    if ("GET" === method) {
      return {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1 },
          path: { type: "string", minLength: 1 },
          target: { enum: ScrapObserver.#TARGET_OPTIONS },
          history: { enum: ScrapObserver.#HISTORY_OPTIONS },
        },
      };
    } else if ("POST" === method) {
      return {
        type: "object",
        additionalProperties: false,
        properties: {
          parent: { type: "string", minLength: 1 },
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

  /**
   * Method used to receive the DB schema of the scraper observer object
   * @returns database schema object
   */
  static getDatabaseSchema() {
    /**
     * Database schema object definition for ScrapObserver
     */
    const schema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, "Missing observer name"],
      },
      path: {
        type: String,
        required: [true, "Missing observer path"],
      },
      target: {
        type: String,
        enum: {
          values: ScrapObserver.#TARGET_OPTIONS,
          message: "Invalid `{PATH}` value: `{VALUE}`",
        },
      },
      history: {
        type: String,
        enum: {
          values: ScrapObserver.#HISTORY_OPTIONS,
          message: "Invalid `{PATH}` value: `{VALUE}`",
        },
      },
      container: String,
      title: {
        type: ScrapComponent.getDatabaseSchema(),
        required: false,
      },
      image: {
        type: ScrapComponent.getDatabaseSchema(),
        required: false,
      },
      data: {
        type: ScrapComponent.getDatabaseSchema(),
        required: true,
      },
    });

    /**
     * Method used to receive the appropriate identifier of observer
     * @returns observer identifier: string composed of title with path field value
     */
    schema.methods.getIdentifier = function () {
      return ScrapObserver.#parseIdentifier(this);
    };

    /**
     * Method used to perform a deep copy of all values in scrap observer object
     * @param {Object} otherObserver The scrap observer object with source values
     */
    schema.methods.copyValues = function (otherObserver) {
      if (!ModelUtils.isInstanceOf(ScrapObserver, otherObserver)) {
        throw new ScrapError("Cannot copy scrap observer values: incompatible object");
      }
      this.name = otherObserver.name;
      this.path = otherObserver.path;
      this.target = otherObserver.target;
      this.history = otherObserver.history;
      this.container = otherObserver.container;
      this.title.copyValues(otherObserver.title);
      this.image.copyValues(otherObserver.image);
      this.data.copyValues(otherObserver.data);
    };

    return schema;
  }

  /**
   * Method used to retrieve identifier from input object
   * @param {Object} observer The value from which we want to retrieve identifier
   * @returns identifier of the provided input object
   */
  static #parseIdentifier(observer) {
    return `name = ${"" !== observer.name ? observer.name : "empty"}`;
  }
}

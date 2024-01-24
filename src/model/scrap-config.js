import { ModelUtils } from "../utils/model-utils.js";
import { ScrapError } from "./scrap-exception.js";
import { ScrapGroup } from "./scrap-group.js";

import mongoose from "mongoose";

export class ScrapConfig {
  static #DATABASE_MODEL = mongoose.model("scraper-config", ScrapConfig.getDatabaseSchema());

  /**
   * Creates a new scrap config from a specified object
   * @param {Object} object The source object
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.user = ModelUtils.getValueOrDefault(input.user, "");
    this.groups = ModelUtils.getArrayOfModels(ScrapGroup, input.groups);
  }

  /**
   * Method used to receive the appropriate identifier of config
   * @returns config identifier: string composed of title with user field value
   */
  getIdentifier() {
    return ScrapConfig.#parseIdentifier(this);
  }

  /**
   * Method used to check correctness of the scrap config values
   * @returns check result containing all errors and warnings
   */
  checkValues() {
    const checkResult = { errors: [], warnings: [] };
    for (let groupNo = 0; groupNo < this.groups.length; groupNo++) {
      const groupCheckResult = this.groups[groupNo].checkValues();
      checkResult.errors.push(...groupCheckResult.errors);
      checkResult.warnings.push(...groupCheckResult.warnings);
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
        user: { type: "string", minLength: 1 },
        groups: { type: "array", items: ScrapGroup.getRequestBodySchema() },
      },
      required: ["user"],
    };
  }

  /**
   * Method used to retrieve JSON schema used for validating request query params
   * @param {String} method The request method type to get accepted query params
   * @returns query parameters JSON schema object
   */
  static getRequestParamsSchema(method) {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        user: { type: "string", minLength: 1 },
      },
    };
  }

  /**
   * Method used to receive the DB model of the scraper configuration object
   * @returns database model object
   */
  static getDatabaseModel() {
    return ScrapConfig.#DATABASE_MODEL;
  }

  /**
   * Method used to receive the DB schema of the scraper configuration object
   * @returns database schema object
   */
  static getDatabaseSchema() {
    /**
     * Database schema object definition for ScrapConfig
     */
    const schema = new mongoose.Schema({
      user: {
        type: mongoose.Types.ObjectId,
        require: [true, "Missing configuration user"],
      },
      groups: {
        type: [ScrapGroup.getDatabaseSchema()],
        require: [true, "Missing configuration groups"],
      },
    });

    /**
     * Method used to receive the appropriate identifier of config
     * @returns config identifier: string composed of title with user field value
     */
    schema.methods.getIdentifier = function () {
      return ScrapConfig.#parseIdentifier(this);
    };

    /**
     * Method used to perform a deep copy of all values in scrap config object
     * @param {Object} otherConfig The scrap config object with source values
     */
    schema.methods.copyValues = function (otherConfig) {
      if (!ModelUtils.isInstanceOf(ScrapConfig, otherConfig)) {
        throw new ScrapError("Cannot copy scrap config values: incompatible object");
      }
      this.user = otherConfig.user;
      this.groups.forEach((group, index) => group.copyValues(otherConfig.groups[index]));
    };

    return schema;
  }

  /**
   * Method used to retrieve identifier from input object
   * @param {Object} config The value from which we want to retrieve identifier
   * @returns identifier of the provided input object
   */
  static #parseIdentifier(config) {
    return `user = ${config.user}`;
  }
}

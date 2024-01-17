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
    return `user = ${this.user}`;
  }

  /**
   * Method used to perform a deep copy of all values in scrap config object
   * @param {Object} otherConfig The scrap config object with source values
   */
  copyValues(otherConfig) {
    if (!ModelUtils.isInstanceOf(ScrapConfig, otherConfig)) {
      throw new ScrapError("Cannot copy scrap config values: incompatible object");
    }
    this.user = otherConfig.user;
    this.groups.forEach((group, index) => group.copyValues(otherConfig.groups[index]));
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
   * Method used to retrieve JSON schema
   * @returns JSON schema object
   */
  static getSchema() {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        user: { type: "integer", minimum: 0 },
        groups: { type: "array", items: ScrapGroup.getSchema() },
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
        user: { type: "integer", minimum: 0 },
      },
    };
  }

  /**
   * Method used to receive the DB model of the scraper user object
   * @returns database model object
   */
    static getDatabaseModel() {
      return ScrapConfig.#DATABASE_MODEL;
    }

  /**
   * Method used to receive the DB schema of the scraper user object
   * @returns database schema object
   */
  static getDatabaseSchema() {
    return new mongoose.Schema({
      user: mongoose.Types.ObjectId,
      groups: [String],
    });
  }
}

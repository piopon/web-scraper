import { ScrapConfig } from "./scrap-config.js";

import mongoose from "mongoose";

export class ScrapUser {
  static #DATABASE_MODEL = mongoose.model("scraper-user", ScrapUser.getDatabaseSchema());

  /**
   * Method used to receive the DB model of the scraper user object
   * @returns database model object
   */
  static getDatabaseModel() {
    return ScrapUser.#DATABASE_MODEL;
  }

  /**
   * Method used to receive the DB schema of the scraper user object
   * @returns database schema object
   */
  static getDatabaseSchema() {
    return new mongoose.Schema({
      name: {
        type: String,
        lowercase: true,
        required: [true, "User name can't be empty"],
        match: [/^[a-zA-Z0-9]+$/, "Provided user name is invalid: {VALUE}"],
      },
      email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email can't be empty"],
        match: [/\S+@\S+\.\S+/, "Provided email is invalid: {VALUE}"],
        index: true,
      },
      password: {
        type: String,
        required: true,
      },
      lastLogin: Date,
      hostUser: mongoose.Types.ObjectId,
      config: {
        type: mongoose.Types.ObjectId,
        ref: ScrapConfig.getDatabaseModel().modelName,
      },
    });
  }
}

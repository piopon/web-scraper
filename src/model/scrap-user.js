import mongoose from "mongoose";

export class ScrapUser {
  static #DATABASE_MODEL = mongoose.model("scraper-user", ScrapUser.#getDatabaseSchema());

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
  static #getDatabaseSchema() {
    return {
      name: {
        type: String,
        lowercase: true,
        required: [true, "User name can't be empty"],
        match: [/^[a-zA-Z0-9]+$/, 'Provided user name is invalid']
      },
      email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email can't be empty"],
        match: [/\S+@\S+\.\S+/, "Provided email is invalid"],
        index: true
      },
      password: {
        type: String,
        required: true
      },
    };
  }
}

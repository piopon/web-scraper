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
      name: String,
      email: String,
      password: String,
    };
  }
}

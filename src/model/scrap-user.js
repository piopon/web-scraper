import mongoose from "mongoose";

export class ScrapUser {
  static #DATABASE_MODEL = mongoose.model("scraper-user", ScrapUser.#getDatabaseSchema());

  static getDatabaseModel() {
    return ScrapUser.#DATABASE_MODEL;
  }

  static #getDatabaseSchema() {
    return {
      name: String,
      email: String,
      password: String,
    };
  }
}

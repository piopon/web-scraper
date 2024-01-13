import mongoose from "mongoose";

export class ScrapUser {
  static #DATABASE_COLLECTION_NAME = "scraper-user";

  static getDatabaseModel() {
    return mongoose.model(ScrapUser.#DATABASE_COLLECTION_NAME, ScrapUser.#getDatabaseSchema());
  }

  static #getDatabaseSchema() {
    return {
      name: String,
      email: String,
      password: String,
    };
  }
}

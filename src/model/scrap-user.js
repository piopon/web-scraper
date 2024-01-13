import mongoose from "mongoose";

export class ScrapUser {
  static #DATABASE_COLLECTION_NAME = "scraper-user";

  static getDatabaseModel(user) {
    const userDatabaseModel = mongoose.model(ScrapUser.#DATABASE_COLLECTION_NAME, ScrapUser.#getDatabaseSchema());
    return new userDatabaseModel({
      name: user.name,
      email: user.email,
      password: user.password,
    });
  }

  static #getDatabaseSchema() {
    return {
      name: String,
      email: String,
      password: String,
    };
  }
}

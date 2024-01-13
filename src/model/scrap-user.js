import mongoose from "mongoose";

export class ScrapUser {
  static db() {
    return mongoose.model("user", ScrapUser.#getDatabaseSchema());
  }

  static #getDatabaseSchema() {
    return {
      name: String,
      email: String,
      password: String,
    };
  }
}

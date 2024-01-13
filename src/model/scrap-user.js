import mongoose from "mongoose";

export class ScrapUser {
  static db(user) {
    const userDatabaseModel = mongoose.model("user", ScrapUser.#getDatabaseSchema());
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

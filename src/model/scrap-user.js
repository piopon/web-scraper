export class ScrapUser {
  static #getDatabaseSchema() {
    return {
      name: String,
      email: String,
      password: String,
    };
  }
}

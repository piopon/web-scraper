import { ScrapUser } from "../model/scrap-user.js";

export class AuthConfig {
  #passport = undefined;

  constructor(passport) {
    this.#passport = passport;
  }

  configure() {
    // configure common serialize and deserialize user logic
    this.#passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    this.#passport.deserializeUser(async (id, done) => {
      const user = await ScrapUser.getDatabaseModel().findById(id);
      done(null, user);
    });
    return this.#passport;
  }
}

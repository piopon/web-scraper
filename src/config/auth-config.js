export class AuthConfig {
  #passport = undefined;

  constructor(passport) {
    this.#passport = passport;
  }

  configure() {
    return this.#passport;
  }
}

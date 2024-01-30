export class AuthRouter {
    #components = [];
    #passport = undefined;

    /**
     * Creates a new auth router for managing user authentication and authorization
     * @param {Array} components The components list used in auth process (LOGIN)
     * @param {Object} passport The object controlling user sing-up and sing-in process
     */
    constructor(components, passport) {
      this.#components = components;
      this.#passport = passport;
    }
}
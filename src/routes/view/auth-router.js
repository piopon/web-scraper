import { ScrapUser } from "../../model/scrap-user.js";

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
    this.#configAuthenitcation(passport);
  }

  /**
   * Method used to configure Passport authentication object
   * @param {Object} passport The auth object to be configured
   */
  #configAuthenitcation(passport) {
    // configure common serialize and deserialize user logic
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    passport.deserializeUser(async (id, done) => {
      const user = await ScrapUser.getDatabaseModel().findById(id);
      done(null, user);
    });
  }
    }
}
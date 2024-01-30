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

  /**
   * Method used to initialize and start view-related components
   * @param {Object} user The authenticated user object for which we want to start components
   * @returns true if all components are invoked, false if at least one has an error
   */
  async #runComponents(user) {
    for (const component of this.#components) {
      // if component is not required to pass then we start it and go to the next one
      if (!component.getInfo().mustPass) {
        component.start(user);
        continue;
      }
      // component must pass so we are waiting for the result to check it
      if (!(await component.start(user))) {
        return false;
      }
    }
    return true;
  }
}

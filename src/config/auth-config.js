import { ScrapUser } from "../model/scrap-user.js";

import { ExtractJwt, Strategy } from "passport-jwt";

export class AuthConfig {
  #passport = undefined;

  constructor(passport) {
    this.#passport = passport;
  }

  /**
   * Method used to configure Passport authentication object
   */
  configure() {
    // configure authenticate logic for specific endpoints
    this.#configJwtStategy();
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

  /**
   * Method used to configurate user JWT login strategy
   * @param {Object} passport The login auth and stategy object
   */
  #configJwtStategy() {
    const options = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    };
    const verify = async (jwtPayload, done) => {
      try {
        const user = await ScrapUser.getDatabaseModel().findById(jwtPayload._id);
        if (user) {
          return done(null, user);
        }
        return done(null, false, { message: "Incorrect token." });
      } catch (error) {
        return done(null, false, { message: error.message });
      }
    };
    this.#passport.use("jwt", new Strategy(options, verify));
  }
}

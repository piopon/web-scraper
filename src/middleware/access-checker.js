import { ScrapUser } from "../model/scrap-user.js";
import { ModelUtils } from "../utils/model-utils.js";

export class AccessChecker {
  /**
   * Method used to check if the current request is eligible to access content data
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} next The next middleware function in the cycle
   */
  static canReceiveData(request, response, next) {
    if (request.isAuthenticated()) {
      return next();
    }
    const jwtOpts = { session: false };
    return request.app.locals.passport.authenticate("jwt", jwtOpts)(request, response, next);
  }

  /**
   * Method used to check if the current request is eligible to access content page(s)
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} next The next middleware function in the cycle
   */
  static async canViewContent(request, response, next) {
    if (request.isAuthenticated()) {
      return next();
    }
    // challenge query parameter will be present only when remote login
    if (request.query.challenge) {
      const remoteOpts = { session: true, failureRedirect: "/auth/login", failureFlash: true };
      return request.app.locals.passport.authenticate("remote-login", remoteOpts)(request, response, next);
    }
    // logout endpoint with demo user name and pass in body means remote logout
    if ("/logout" === request.url && ModelUtils.hasExactKeys(request.body, ["demo-user", "demo-pass"])) {
      const demoUser = await ScrapUser.getDatabaseModel().findOne({ hostUser: { $ne: null } });
      if (demoUser) {
        request.user = demoUser;
      }
      next();
    }
    const jwtOpts = { session: false, failureRedirect: "/auth/login" };
    return request.app.locals.passport.authenticate("jwt", jwtOpts)(request, response, next);
  }

  /**
   * Method used to check if the current request is eligible to access user session pages (login, register, etc.)
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} next The next middleware function in the cycle
   */
  static canViewSessionUser(request, response, next) {
    if (!request.isAuthenticated()) {
      return next();
    }
    const jwtOpts = { session: false, failureRedirect: "/" };
    return request.app.locals.passport.authenticate("jwt", jwtOpts)(request, response, next);
  }
}

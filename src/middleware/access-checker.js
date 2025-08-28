import { ScrapUser } from "../model/scrap-user.js";

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
    if (request.query.challenge) {
      const user = await ScrapUser.getDatabaseModel().find({ challenge: request.query.challenge });
      if (user.length !== 1) {
        return response.status(400).json("Provided challenge phrase is not valid");
      }
      // we should perform login here so request contains user property...
      return next();
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

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
  static canViewContent(request, response, next) {
    if (request.isAuthenticated()) {
      return next();
    }
    const jwtOpts = {
      session: false,
    };
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
    const jwtOpts = {
      session: false,
    };
    return request.app.locals.passport.authenticate("jwt", jwtOpts)(request, response, next);
  }
}

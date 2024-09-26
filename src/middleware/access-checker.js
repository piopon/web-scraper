export class AccessChecker {
  static canReceiveData(request, response, next) {
    if (request.isAuthenticated()) {
      return next();
    }
    response.status(401).json("Not authenticated");
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
    response.redirect("/auth/login");
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
    response.redirect("/");
  }
}

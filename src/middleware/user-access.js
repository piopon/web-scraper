export class UserAccess {
  /**
   * Method used to check if the current request is eligible to access content page(s)
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} next The next middleware function in the cycle
   */
  static canAccessContent(request, response, next) {
    if (request.isAuthenticated()) {
      return next();
    }
    response.redirect("/login");
  }
}

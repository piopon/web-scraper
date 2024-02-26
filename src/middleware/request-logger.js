export class RequestLogger {
  /**
   * This method is used in server middleware to log requests
   * @param {Object} logger The logger which should be used to log requests
   * @returns middleware function using the input logger to printout incoming requests
   */
  static middleware(logger) {
    return (request, response, next) => {
      const url = `${request.protocol}://${request.get("host")}${request.originalUrl}`;
      logger.debug(`${request.method} request - ${url}`);
      next();
    };
  }
}

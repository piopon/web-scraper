import { ModelUtils } from "../utils/model-utils.js";

export class ParamsParser {
  /**
   * This method is used in server middleware to parse any request parameters (path or query)
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} next The next middleware function in the cycle
   */
  static middleware(request, response, next) {
    ParamsParser.#tryParse(request.params);
    ParamsParser.#tryParse(request.query);
    next();
  }

  /**
   * Method used to check and try to parse input parameters
   * @param {Object} params The parameters object which we want to parse
   * @returns the parsed parameter object
   */
  static #tryParse(params) {
    if (params && !ModelUtils.isEmpty(params)) {
      console.log("Parsing params:");
      console.log(params);
    }
  }
}

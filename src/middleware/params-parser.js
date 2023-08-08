import { ModelUtils } from "../utils/model-utils.js";

export class ParamsParser {
  static middleware(request, response, next) {
    ParamsParser.#tryParse(request.params);
    ParamsParser.#tryParse(request.query);
    next();
  }

  static #tryParse(params) {
    if (params && !ModelUtils.isEmpty(params)) {
      console.log("Parsing params:");
      console.log(params);
    }
  }
}

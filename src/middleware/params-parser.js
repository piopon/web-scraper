export class ParamsParser {
  static middleware(request, response, next) {
    if (request.params) {
      ParamsParser.#parse(request.params);
    }
    if (request.query) {
      ParamsParser.#parse(request.query);
    }
    next();
  }

  static #parse(params) {
    console.log("Parsing params:");
    console.log(params);
  }
}

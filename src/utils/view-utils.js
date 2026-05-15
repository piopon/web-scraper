export class ViewUtils {
  /**
   * Method used to build handlebars helper functions used by view templates
   * @returns object containing registered template helper functions
   */
  static createViewHelpers() {
    return {
      year: () => new Date().getFullYear(),
      append: (...args) => args.slice(0, -1).join(""),
      and: (...args) => args.slice(0, -1).every(Boolean),
      or: (...args) => args.slice(0, -1).some(Boolean),
      eq: (left, right) => left === right,
      gt: (left, right) => left > right,
      length: (value) => value?.length ?? 0,
      unlessEq: (left, right) => left !== right,
      split: (value, separator) => this.#toArray(value, separator),
      last: (value) => (Array.isArray(value) && value.length > 0 ? value[value.length - 1] : ""),
      contains: (value, text) => String(value ?? "").includes(String(text ?? "")),
      remove: (value, text) => String(value ?? "").split(String(text ?? "")).join(""),
      equalsLength: (value, expected) => (value?.length ?? 0) === expected,
    };
  }

  static #toArray(value, separator = "|") {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value !== "string") {
      return [];
    }
    return value.split(separator);
  }
}
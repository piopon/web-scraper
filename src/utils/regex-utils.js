export class RegexUtils {
  /**
   * Method used to escape input string characters to be useful for regex
   * @param {String} input The string which chars we want to escape
   * @returns string with escaped characters
   */
  static escape(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Method used to parse the input string and receive price values
   * @param {String} string The input string from which we want to retrieve prices
   * @returns an array of strings containig price values, or empty array if none found
   */
  static getPrices(string) {
    return string.replace(",", ".").match(/\d+(?:\.\d+)?/g);
  }

  static getIpAddress(input) {
    return input.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
  }

  /**
   * Method used to check if the provided string value is an unsigned integer
   * @param {String} string The input string value to be checked
   * @returns true if the string value is an unsigned integer, false otherwise
   */
  static isUnsignedInteger(string) {
    return new RegExp("^[0-9]+$").test(string);
  }

  /**
   * Method used to check if the provided string value is a signed integer
   * @param {String} string The input string value to be checked
   * @returns true if the string value is a signed integer, false otherwise
   */
  static isSignedInteger(string) {
    return new RegExp("^-?[0-9]+$").test(string);
  }

  /**
   * Method used to check if the provided string value is a boolean
   * @param {String} string The input string value to be checked
   * @returns true if the string value is a boolean, false otherwise
   */
  static isBoolean(string) {
    return string === "true" || string === "false";
  }
}

export class RegexUtils {
  /**
   * Method used to parse the input string and receive price values
   * @param {String} string The input string from which we want to retrieve prices
   * @returns an array of strings containig price values, or empty array if none found
   */
  static getPrices(string) {
    return string.replace(",", ".").match(/\d+(?:\.\d+)?/g);
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
}

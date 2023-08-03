export class RegexUtils {
  /**
   * Method used to parse the input string and receive price values
   * @param {String} string The input string from which we want to retrieve prices
   * @returns an array of strings containig price values, or empty array if none found
   */
  static getPrices(string) {
    return string.replace(",", ".").match(/\d+(?:\.\d+)?/g);
  }
}

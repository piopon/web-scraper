export class RegexUtils {
  static getPrices(string) {
    return string.replace(",", ".").match(/\d+(?:\.\d+)?/g);
  }
}

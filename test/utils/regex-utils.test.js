import { RegexUtils } from "../../src/utils/regex-utils.js";

describe("getPrices", () => {
  test("returns correct price with extra suffix", () => {
    expect(RegexUtils.getPrices("12.33 PLN")).toStrictEqual(["12.33"]);
  });
  test("returns correct price with extra prefix", () => {
    expect(RegexUtils.getPrices("$3.567")).toStrictEqual(["3.567"]);
  });
  test("returns correct price with extra suffix and prefix", () => {
    expect(RegexUtils.getPrices("PRICE: 1.99 PLN")).toStrictEqual(["1.99"]);
  });
  test("returns correct price with comma", () => {
    expect(RegexUtils.getPrices("39,99")).toStrictEqual(["39.99"]);
  });
  test("returns correct price with multiple values", () => {
    expect(RegexUtils.getPrices("PRICE: $39.99 | 43,99PLN | EUR41.99")).toStrictEqual(["39.99", "43.99", "41.99"]);
  });
});

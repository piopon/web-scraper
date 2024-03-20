import { RegexUtils } from "../../src/utils/regex-utils.js";

describe("getPrices", () => {
  test("returns correct price with extra suffix", () => {
    const input = "12.33 PLN";
    const result = ["12.33"];
    expect(RegexUtils.getPrices(input)).toStrictEqual(result);
  });
  test("returns correct price with extra prefix", () => {
    const input = "$3.567";
    const result = ["3.567"];
    expect(RegexUtils.getPrices(input)).toStrictEqual(result);
  });
  test("returns correct price with extra suffix and prefix", () => {
    const input = "PRICE: 1.99 PLN";
    const result = ["1.99"];
    expect(RegexUtils.getPrices(input)).toStrictEqual(result);
  });
  test("returns correct price with comma", () => {
    const input = "39,99";
    const result = ["39.99"];
    expect(RegexUtils.getPrices(input)).toStrictEqual(result);
  });
  test("returns correct price with multiple values", () => {
    const input = "PRICE: $39.99 | 43,99PLN | EUR41.99";
    const result = ["39.99", "43.99", "41.99"];
    expect(RegexUtils.getPrices(input)).toStrictEqual(result);
  });
});

describe("isUnsignedInteger", () => {
  test("returns true when unsigned integer is used", () => {
    expect(RegexUtils.isUnsignedInteger("1234")).toBe(true);
  });
  test("returns false when signed integer is used", () => {
    expect(RegexUtils.isUnsignedInteger("-1234")).toBe(false);
  });
});

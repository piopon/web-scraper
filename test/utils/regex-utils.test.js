import { RegexUtils } from "../../src/utils/regex-utils.js";

describe("getPrices", () => {
  test("returns correct price with extra suffix", () => {
    expect(RegexUtils.getPrices("12.33 PLN")).toStrictEqual(["12.33"]);
  });
});

import { ScrapConfig } from "../../src/model/scrap-config.js";

describe("getIdentifier", () => {
  describe("returns correct result for group", () => {
    test("with empty user value", () => {
      const inputObj = {};
      const expected = "user = empty";
      expect(new ScrapConfig(inputObj).getIdentifier()).toBe(expected);
    });
    test("with missing user value", () => {
      const inputObj = { name: "test-name" };
      const expected = "user = empty";
      expect(new ScrapConfig(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty user value", () => {
      const inputObj = { user: "test-user" };
      const expected = "user = test-user";
      expect(new ScrapConfig(inputObj).getIdentifier()).toBe(expected);
    });
  });
});

import { ScrapGroup } from "../../src/model/scrap-group.js";

describe("getIdentifier", () => {
  describe("returns correct result for group", () => {
    test("with empty name values", () => {
      const inputObj = {};
      const expected = "name = empty";
      expect(new ScrapGroup(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty name value", () => {
      const inputObj = { name: "test-name" };
      const expected = "name = test-name";
      expect(new ScrapGroup(inputObj).getIdentifier()).toBe(expected);
    });
  });
});

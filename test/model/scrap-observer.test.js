import { ScrapObserver } from "../../src/model/scrap-observer.js";

describe("getIdentifier", () => {
  describe("returns correct result for observer", () => {
    test("with empty name values", () => {
      const inputObj = {};
      const expected = "name = empty";
      expect(new ScrapObserver(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty name value", () => {
      const inputObj = { name: "test-name" };
      const expected = "name = test-name";
      expect(new ScrapObserver(inputObj).getIdentifier()).toBe(expected);
    });
  });
});

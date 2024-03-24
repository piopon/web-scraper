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

describe("checkValues", () => {
  test("returns no errors and warnings when object has correct value", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
    const expected = { errors: [], warnings: [] };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
});

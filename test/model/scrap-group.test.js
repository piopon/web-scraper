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

describe("checkValues", () => {
  test("returns no errors and warnings when object has correct values", () => {
    const inputObj = {
      name: "test-name",
      category: "test-path",
      domain: "test-domain",
      observers: [createTestObserver("test-name1", "test-path1")],
    };
    const expected = {
      errors: [],
      warnings: [],
    };
    expect(new ScrapGroup(inputObj).checkValues()).toStrictEqual(expected);
  });
});

function createTestObserver(name, path) {
  return {
    name: name,
    path: path,
    title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
    image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
  };
}

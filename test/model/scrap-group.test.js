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
  test("returns correct error for missing name field", () => {
    const inputObj = {
      category: "test-path",
      domain: "test-domain",
      observers: [createTestObserver("test-name1", "test-path1")],
    };
    const expected = {
      errors: ["Missing required group name"],
      warnings: [],
    };
    expect(new ScrapGroup(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for incorrect name field", () => {
    const inputObj = {
      name: "1",
      category: "test-path",
      domain: "test-domain",
      observers: [createTestObserver("test-name1", "test-path1")],
    };
    const expected = {
      errors: ["Group name must have at least one letter"],
      warnings: [],
    };
    expect(new ScrapGroup(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing category field", () => {
    const inputObj = {
      name: "test-name",
      domain: "test-domain",
      observers: [createTestObserver("test-name1", "test-path1")],
    };
    const expected = {
      errors: [],
      warnings: ["Empty group category"],
    };
    expect(new ScrapGroup(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing name domain", () => {
    const inputObj = {
      name: "test-name",
      category: "test-path",
      observers: [createTestObserver("test-name1", "test-path1")],
    };
    const expected = {
      errors: ["Missing required group domain"],
      warnings: [],
    };
    expect(new ScrapGroup(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct warning for missing observers", () => {
    const inputObj = {
      name: "test-name",
      domain: "test-domain",
      category: "test-path",
      observers: [],
    };
    const expected = {
      errors: [],
      warnings: ["Add at least one observer to make things work properly"],
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

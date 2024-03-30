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

describe("checkValues", () => {
  test("returns no errors and warnings when object has correct values", () => {
    const inputObj = {
      user: "test-user",
      groups: [createTestGroup("test-name", "test-domain")],
    };
    const expected = {
      errors: [],
      warnings: [],
    };
    expect(new ScrapConfig(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns no errors even with missing user field", () => {
    const inputObj = {
      groups: [createTestGroup("test-name", "test-domain")],
    };
    const expected = {
      errors: [],
      warnings: [],
    };
    expect(new ScrapConfig(inputObj).checkValues()).toStrictEqual(expected);
  });
});

function createTestGroup(name, domain) {
  return {
    name: name,
    category: "test-category",
    domain: domain,
    observers: [createTestObserver("observer-name", "observer-path")],
  };
}

function createTestObserver(name, path) {
    return {
      name: name,
      path: path,
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
  }

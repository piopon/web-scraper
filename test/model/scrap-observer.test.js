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
  test("returns correct error for missing name field", () => {
    const inputObj = {
      path: "test-path",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
    const expected = { errors: ["Missing required observer name"], warnings: [] };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing name field", () => {
    const inputObj = {
      name: "1",
      path: "test-path",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
    const expected = { errors: ["Observer name must have at least one letter"], warnings: [] };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct warning for missing title component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
    const expected = {
      errors: [],
      warnings: ["Empty title 'selector'/'attribute' and 'auxiliary' in observer test-path"],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct warning for missing image component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
    const expected = {
      errors: [],
      warnings: ["Empty image 'selector'/'attribute' and 'auxiliary' in observer test-path"],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct errors for missing price component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    };
    const expected = {
      errors: [
        "Missing required 'price.selector' in observer test-path",
        "Missing required 'price.attribute' in observer test-path",
        "Missing required 'price.auxiliary' in observer test-path",
      ],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
});

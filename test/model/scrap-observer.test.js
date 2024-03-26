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
    const expected = {
      errors: [],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing name field", () => {
    const inputObj = {
      path: "test-path",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
    const expected = {
      errors: ["Missing required observer name"],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for incorrect name field", () => {
    const inputObj = {
      name: "1",
      path: "test-path",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
    const expected = {
      errors: ["Observer name must have at least one letter"],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing path field", () => {
    const inputObj = {
      name: "test-name",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
      price: { selector: "price-selector", attribute: "price-attribute", auxiliary: "price-attribute" },
    };
    const expected = {
      errors: ["Missing required observer path"],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct warning for missing whole title component", () => {
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
  test("returns correct warning for missing whole image component", () => {
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
  test("returns correct errors for missing whole price component", () => {
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
  test("returns correct error for missing price.selector component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      price: { attribute: "price-attribute", auxiliary: "price-auxiliary" },
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    };
    const expected = {
      errors: ["Missing required 'price.selector' in observer test-path"],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing price.attribute component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      price: { selector: "price-selector", auxiliary: "price-auxiliary" },
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    };
    const expected = {
      errors: ["Missing required 'price.attribute' in observer test-path"],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing price.auxiliary component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      price: { selector: "price-selector", attribute: "price-attribute" },
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    };
    const expected = {
      errors: ["Missing required 'price.auxiliary' in observer test-path"],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
});

describe("getRequestBodySchema", () => {
  test("returns correct value", () => {
    const expectedHistory = ["off", "on", "onChange"];
    const expectedTargets = ["load", "domcontentloaded", "networkidle0", "networkidle2"];
    const schema = ScrapObserver.getRequestBodySchema();
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.path).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.target).toStrictEqual({ enum: expectedTargets });
    expect(schema.properties.history).toStrictEqual({ enum: expectedHistory });
    expect(schema.properties.container).toStrictEqual({ type: "string" });
    expect(schema.properties.title).not.toBe(null);
    expect(schema.properties.image).not.toBe(null);
    expect(schema.properties.price).not.toBe(null);
    expect(schema.required).toStrictEqual(["name", "path", "price"]);
  });
});

describe("getRequestParamsSchema", () => {
  const expectedHistory = ["off", "on", "onChange"];
  const expectedTargets = ["load", "domcontentloaded", "networkidle0", "networkidle2"];
  test("returns correct value for GET input method", () => {
    const schema = ScrapObserver.getRequestParamsSchema("GET");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.path).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.target).toStrictEqual({ enum: expectedTargets });
    expect(schema.properties.history).toStrictEqual({ enum: expectedHistory });
    expect(schema.required).toBe(undefined);
  });
  test("returns correct value for POST input method", () => {
    const schema = ScrapObserver.getRequestParamsSchema("POST");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.parent).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toStrictEqual(["parent"]);
  });
  test("returns correct value for other input method", () => {
    const schema = ScrapObserver.getRequestParamsSchema("PUT");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toStrictEqual(["name"]);
  });
});
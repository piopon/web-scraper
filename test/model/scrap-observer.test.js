import { ScrapObserver } from "../../src/model/scrap-observer.js";

import mongoose from "mongoose";

describe("getIdentifier", () => {
  describe("returns correct result for observer", () => {
    test("with empty name value", () => {
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
  const expectedHistory = ["off", "on", "onChange"];
  const expectedTargets = ["load", "domcontentloaded", "networkidle0", "networkidle2"];
  test("returns correct value", () => {
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
    expect(schema.required).toStrictEqual(undefined);
  });
  test("returns correct value for POST input method", () => {
    const schema = ScrapObserver.getRequestParamsSchema("POST");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.parent).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toStrictEqual(["parent"]);
  });
  test("returns correct value for PUT input method", () => {
    const schema = ScrapObserver.getRequestParamsSchema("PUT");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toStrictEqual(["name"]);
  });
  test("returns correct value for DELETE input method", () => {
    const schema = ScrapObserver.getRequestParamsSchema("DELETE");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toStrictEqual(["name"]);
  });
});

describe("getDatabaseSchema", () => {
  test("returns correct value", () => {
    const schema = ScrapObserver.getDatabaseSchema();
    expect(schema).not.toBe(null);
  });
  test("gets schema used for create observer", () => {
    const TestModel = mongoose.model("test-observer", ScrapObserver.getDatabaseSchema())
    const observer = new TestModel({
      unknown: "test-unknown",
      name: "test-name",
      path: "test-path",
      target: "domcontentloaded",
      history: "off",
      container: "test-container",
      price : {
        selector: "test-selector",
        attribute: "test-attribute",
        auxiliary: "test-auxiliary",
      },
      extra: "test-extra",
    });
    expect(observer).not.toBe(null);
    expect(observer.unknown).toBe(undefined);
    expect(observer.name).toBe("test-name");
    expect(observer.path).toBe("test-path");
    expect(observer.target).toBe("domcontentloaded");
    expect(observer.history).toBe("off");
    expect(observer.container).toBe("test-container");
    expect(observer.price.selector).toBe("test-selector");
    expect(observer.price.attribute).toBe("test-attribute");
    expect(observer.price.auxiliary).toBe("test-auxiliary");
    expect(observer.extra).toBe(undefined);
  });
});
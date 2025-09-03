import { ScrapObserver } from "../../src/model/scrap-observer.js";
import { ScrapError } from "../../src/model/scrap-exception.js";

import mongoose from "mongoose";

describe("getIdentifier", () => {
  describe("returns correct result for observer", () => {
    test("with empty name value", () => {
      const inputObj = {};
      const expected = "name = empty";
      expect(new ScrapObserver(inputObj).getIdentifier()).toBe(expected);
    });
    test("with missing name value", () => {
      const inputObj = { unknown: "test-unknown" };
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
      data: { selector: "data-selector", attribute: "data-attribute", auxiliary: "data-attribute" },
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
      data: { selector: "data-selector", attribute: "data-attribute", auxiliary: "data-attribute" },
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
      data: { selector: "data-selector", attribute: "data-attribute", auxiliary: "data-attribute" },
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
      data: { selector: "data-selector", attribute: "data-attribute", auxiliary: "data-attribute" },
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
      data: { selector: "data-selector", attribute: "data-attribute", auxiliary: "data-attribute" },
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
      data: { selector: "data-selector", attribute: "data-attribute", auxiliary: "data-attribute" },
    };
    const expected = {
      errors: [],
      warnings: ["Empty image 'selector'/'attribute' and 'auxiliary' in observer test-path"],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct errors for missing whole data component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    };
    const expected = {
      errors: [
        "Missing required 'data.selector' in observer test-path",
        "Missing required 'data.attribute' in observer test-path",
        "Missing required 'data.auxiliary' in observer test-path",
      ],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing data.selector component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      data: { attribute: "data-attribute", auxiliary: "data-auxiliary" },
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    };
    const expected = {
      errors: ["Missing required 'data.selector' in observer test-path"],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing data.attribute component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      data: { selector: "data-selector", auxiliary: "data-auxiliary" },
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    };
    const expected = {
      errors: ["Missing required 'data.attribute' in observer test-path"],
      warnings: [],
    };
    expect(new ScrapObserver(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns correct error for missing data.auxiliary component", () => {
    const inputObj = {
      name: "test-name",
      path: "test-path",
      data: { selector: "data-selector", attribute: "data-attribute" },
      title: { selector: "title-selector", attribute: "title-attribute", auxiliary: "title-auxiliary" },
      image: { selector: "image-selector", attribute: "image-attribute", auxiliary: "image-attribute" },
    };
    const expected = {
      errors: ["Missing required 'data.auxiliary' in observer test-path"],
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
    expect(schema.properties.data).not.toBe(null);
    expect(schema.required).toStrictEqual(["name", "path", "data"]);
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
  describe("gets schema used for create observer", () => {
    const TestModel = mongoose.model("test-observer", ScrapObserver.getDatabaseSchema());
    const observer = new TestModel({
      unknown: "test-unknown",
      name: "test-name",
      path: "test-path",
      target: "domcontentloaded",
      history: "off",
      container: "test-container",
      title: {
        interval: "1H",
        selector: "test-title-selector",
        attribute: "test-title-attribute",
        auxiliary: "test-title-auxiliary",
      },
      image: {
        interval: "1M",
        selector: "test-image-selector",
        attribute: "test-image-attribute",
        auxiliary: "test-image-auxiliary",
      },
      data: {
        interval: "1m",
        selector: "test-data-selector",
        attribute: "test-data-attribute",
        auxiliary: "test-data-auxiliary",
      },
      extra: "test-extra",
    });
    test("which is not null", () => {
      expect(observer).not.toBe(null);
    });
    test("which has correct field values", () => {
      expect(observer.unknown).toBe(undefined);
      expect(observer.name).toBe("test-name");
      expect(observer.path).toBe("test-path");
      expect(observer.target).toBe("domcontentloaded");
      expect(observer.history).toBe("off");
      expect(observer.container).toBe("test-container");
      expect(observer.title.interval).toBe("1H");
      expect(observer.title.selector).toBe("test-title-selector");
      expect(observer.title.attribute).toBe("test-title-attribute");
      expect(observer.title.auxiliary).toBe("test-title-auxiliary");
      expect(observer.image.interval).toBe("1M");
      expect(observer.image.selector).toBe("test-image-selector");
      expect(observer.image.attribute).toBe("test-image-attribute");
      expect(observer.image.auxiliary).toBe("test-image-auxiliary");
      expect(observer.data.interval).toBe("1m");
      expect(observer.data.selector).toBe("test-data-selector");
      expect(observer.data.attribute).toBe("test-data-attribute");
      expect(observer.data.auxiliary).toBe("test-data-auxiliary");
      expect(observer.extra).toBe(undefined);
    });
    test("which has getIdentifier method returning correct result", () => {
      const expected = `name = test-name`;
      expect(observer.getIdentifier()).toBe(expected);
    });
    test("which has copyValues method throwing on invalid object", () => {
      let sourceObject = { unknown: "" };
      expect(() => observer.copyValues(sourceObject)).toThrow(ScrapError);
    });
    test("which has copyValues method returning correct result", () => {
      let sourceObject = {
        name: "new-name",
        path: "new-path",
        target: "domcontentloaded",
        history: "off",
        container: "new-container",
        title: {
          interval: "7d",
          selector: "new-title-selector",
          attribute: "new-title-attribute",
          auxiliary: "new-title-auxiliary",
        },
        image: {
          interval: "1w",
          selector: "new-image-selector",
          attribute: "new-image-attribute",
          auxiliary: "new-image-auxiliary",
        },
        data: {
          interval: "10y",
          selector: "new-data-selector",
          attribute: "new-data-attribute",
          auxiliary: "new-data-auxiliary",
        },
      };
      expect(() => observer.copyValues(sourceObject)).not.toThrow();
      expect(observer.name).toBe("new-name");
      expect(observer.path).toBe("new-path");
      expect(observer.target).toBe("domcontentloaded");
      expect(observer.history).toBe("off");
      expect(observer.container).toBe("new-container");
      expect(observer.title).not.toBe(undefined);
      expect(observer.title.interval).toBe("7d");
      expect(observer.title.selector).toBe("new-title-selector");
      expect(observer.title.attribute).toBe("new-title-attribute");
      expect(observer.title.auxiliary).toBe("new-title-auxiliary");
      expect(observer.image).not.toBe(undefined);
      expect(observer.image.interval).toBe("1w");
      expect(observer.image.selector).toBe("new-image-selector");
      expect(observer.image.attribute).toBe("new-image-attribute");
      expect(observer.image.auxiliary).toBe("new-image-auxiliary");
      expect(observer.data).not.toBe(undefined);
      expect(observer.data.interval).toBe("10y");
      expect(observer.data.selector).toBe("new-data-selector");
      expect(observer.data.attribute).toBe("new-data-attribute");
      expect(observer.data.auxiliary).toBe("new-data-auxiliary");
    });
  });
});

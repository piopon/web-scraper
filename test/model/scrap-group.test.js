import { ScrapGroup } from "../../src/model/scrap-group.js";
import { ScrapError } from "../../src/model/scrap-exception.js";

import mongoose from "mongoose";

describe("getIdentifier", () => {
  describe("returns correct result for group", () => {
    test("with empty name value", () => {
      const inputObj = {};
      const expected = "name = empty";
      expect(new ScrapGroup(inputObj).getIdentifier()).toBe(expected);
    });
    test("with missing name value", () => {
      const inputObj = { extra: "test-extra" };
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
  test("correctly aggregates observers issues", () => {
    const inputObj = {
      name: "test-name",
      domain: "test-domain",
      category: "test-path",
      observers: [createTestObserver("test-name1"), createTestObserver()],
    };
    const expected = {
      errors: ["Missing required observer path", "Missing required observer name", "Missing required observer path"],
      warnings: [],
    };
    expect(new ScrapGroup(inputObj).checkValues()).toStrictEqual(expected);
  });
});

describe("getRequestBodySchema", () => {
  test("returns correct value", () => {
    const schema = ScrapGroup.getRequestBodySchema();
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.category).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.domain).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.observers).not.toBe(null);
    expect(schema.required).toStrictEqual(["name", "domain", "observers"]);
  });
});

describe("getRequestParamsSchema", () => {
  test("returns correct value for GET input method", () => {
    const schema = ScrapGroup.getRequestParamsSchema("GET");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.category).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.domain).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toBe(undefined);
  });
  test("returns correct value for POST input method", () => {
    const schema = ScrapGroup.getRequestParamsSchema("POST");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.parent).toStrictEqual({ type: "integer", minimum: 0 });
    expect(schema.required).toBe(undefined);
  });
  test("returns correct value for PUT input method", () => {
    const schema = ScrapGroup.getRequestParamsSchema("PUT");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toStrictEqual(["name"]);
  });
  test("returns correct value for DELETE input method", () => {
    const schema = ScrapGroup.getRequestParamsSchema("DELETE");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.name).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toStrictEqual(["name"]);
  });
});

describe("getDatabaseSchema", () => {
  test("returns correct value", () => {
    const schema = ScrapGroup.getDatabaseSchema();
    expect(schema).not.toBe(null);
  });
  describe("gets schema used for create group", () => {
    const TestModel = mongoose.model("test-group", ScrapGroup.getDatabaseSchema());
    const group = new TestModel({
      unknown: "test-unknown",
      name: "test-name",
      category: "test-path",
      domain: "domcontentloaded",
      observers: [createTestObserver("observer-name", "observer-path")],
      extra: "test-extra",
    });
    test("which is not null", () => {
      expect(group).not.toBe(null);
    });
    test("which has correct field values", () => {
      expect(group.unknown).toBe(undefined);
      expect(group.name).toBe("test-name");
      expect(group.category).toBe("test-path");
      expect(group.domain).toBe("domcontentloaded");
      expect(group.observers.length).toBe(1);
      expect(group.extra).toBe(undefined);
    });
    test("which has getIdentifier method returning correct result", () => {
      const expected = `name = test-name`;
      expect(group.getIdentifier()).toBe(expected);
    });
    test("which has copyValues method throwing on invalid object", () => {
      let sourceObject = { unknown: "" };
      expect(() => group.copyValues(sourceObject)).toThrow(ScrapError);
    });
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

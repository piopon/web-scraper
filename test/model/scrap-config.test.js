import { ScrapConfig } from "../../src/model/scrap-config.js";

import mongoose from "mongoose";

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
  test("returns no errors for empty group container", () => {
    const inputObj = {
      user: "test-user",
      groups: [],
    };
    const expected = {
      errors: [],
      warnings: [],
    };
    expect(new ScrapConfig(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns no errors for missing group container", () => {
    const inputObj = {
      user: "test-user",
    };
    const expected = {
      errors: [],
      warnings: [],
    };
    expect(new ScrapConfig(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("correctly aggregates groups issues", () => {
    const inputObj = {
      user: "test-user",
      groups: [createTestGroup()],
    };
    const expected = {
      errors: [
        "Missing required group name",
        "Missing required group domain",
      ],
      warnings: [],
    };
    expect(new ScrapConfig(inputObj).checkValues()).toStrictEqual(expected);
  });
});

describe("getRequestBodySchema", () => {
  test("returns correct value", () => {
    const schema = ScrapConfig.getRequestBodySchema();
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.user).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.groups).not.toBe(null);
    expect(schema.required).toStrictEqual(["user"]);
  });
});

describe("getRequestParamsSchema", () => {
  test("returns correct value for GET input method", () => {
    const schema = ScrapConfig.getRequestParamsSchema("GET");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.user).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.required).toBe(undefined);
  });
});

describe("getDatabaseSchema", () => {
  test("returns correct value", () => {
    const schema = ScrapConfig.getDatabaseSchema();
    expect(schema).not.toBe(null);
  });
  test("gets schema used for create config", () => {
    const TestModel = mongoose.model("test-config", ScrapConfig.getDatabaseSchema());
    const config = new TestModel({
      unknown: "test-unknown",
      user: "test-user",
      groups: [createTestGroup("group-name", "group-domain")],
      extra: "test-extra",
    });
    expect(config).not.toBe(null);
    expect(config.unknown).toBe(undefined);
    expect(config.user).toBe("test-user");
    expect(config.groups.length).toBe(1);
    expect(config.extra).toBe(undefined);
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

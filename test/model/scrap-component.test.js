import { ScrapComponent } from "../../src/model/scrap-component.js";

import mongoose from "mongoose";

describe("getIdentifier", () => {
  describe("returns correct result for component", () => {
    test("with all empty values", () => {
      const inputObj = {};
      const expected = "component = empty | empty | empty";
      expect(new ScrapComponent(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty selector", () => {
      const inputObj = { selector: "selector" };
      const expected = "component = selector | empty | empty";
      expect(new ScrapComponent(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty attribute", () => {
      const inputObj = { attribute: "attribute" };
      const expected = "component = empty | attribute | empty";
      expect(new ScrapComponent(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty auxiliary", () => {
      const inputObj = { auxiliary: "auxiliary" };
      const expected = "component = empty | empty | auxiliary";
      expect(new ScrapComponent(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty selector and attribute", () => {
      const inputObj = { selector: "selector", attribute: "attribute" };
      const expected = "component = selector | attribute | empty";
      expect(new ScrapComponent(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty selector and auxiliary", () => {
      const inputObj = { selector: "selector", auxiliary: "auxiliary" };
      const expected = "component = selector | empty | auxiliary";
      expect(new ScrapComponent(inputObj).getIdentifier()).toBe(expected);
    });
    test("with non-empty attribute and auxiliary", () => {
      const inputObj = { attribute: "attribute", auxiliary: "auxiliary" };
      const expected = "component = empty | attribute | auxiliary";
      expect(new ScrapComponent(inputObj).getIdentifier()).toBe(expected);
    });
    test("with all non-empty fields", () => {
      const inputObj = { selector: "selector", attribute: "attribute", auxiliary: "auxiliary" };
      const expected = "component = selector | attribute | auxiliary";
      expect(new ScrapComponent(inputObj).getIdentifier()).toBe(expected);
    });
  });
});

describe("checkValues", () => {
  test("returns no errors and warnings when auxiliary is not empty", () => {
    const inputObj = { auxiliary: "auxiliary" };
    const expected = { errors: [], warnings: [] };
    expect(new ScrapComponent(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns no errors and warnings when selector and attribute are not empty", () => {
    const inputObj = { selector: "selector", attribute: "attribute" };
    const expected = { errors: [], warnings: [] };
    expect(new ScrapComponent(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns warning when auxiliary and attribute are empty", () => {
    const inputObj = { selector: "selector" };
    const expected = { errors: [], warnings: ["Empty title 'selector'/'attribute' and 'auxiliary'"] };
    expect(new ScrapComponent(inputObj).checkValues()).toStrictEqual(expected);
  });
  test("returns warning when auxiliary and selector are empty", () => {
    const inputObj = { attribute: "attribute" };
    const expected = { errors: [], warnings: ["Empty title 'selector'/'attribute' and 'auxiliary'"] };
    expect(new ScrapComponent(inputObj).checkValues()).toStrictEqual(expected);
  });
});

describe("getRequestBodySchema", () => {
  test("returns correct value", () => {
    const schema = ScrapComponent.getRequestBodySchema();
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.interval).toStrictEqual({ type: "string" });
    expect(schema.properties.selector).toStrictEqual({ type: "string" });
    expect(schema.properties.attribute).toStrictEqual({ type: "string" });
    expect(schema.properties.auxiliary).toStrictEqual({ type: "string" });
    expect(schema.required).toStrictEqual(["selector", "attribute", "auxiliary"]);
  });
});

describe("getRequestParamsSchema", () => {
  test("returns correct value", () => {
    const schema = ScrapComponent.getRequestParamsSchema();
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).not.toBe(null);
    expect(schema.properties.source).toStrictEqual({ enum: ["title", "image", "price"] });
    expect(schema.properties.interval).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.selector).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.attribute).toStrictEqual({ type: "string", minLength: 1 });
    expect(schema.properties.auxiliary).toStrictEqual({ type: "string", minLength: 1 });
  });
});

describe("getDatabaseSchema", () => {
  test("returns correct value", () => {
    const schema = ScrapComponent.getDatabaseSchema();
    expect(schema).not.toBe(null);
  });
  test("gets schema used for create component", () => {
    const TestModel = mongoose.model("test-component", ScrapComponent.getDatabaseSchema())
    const component = new TestModel({
      unknown: "test-unknown",
      interval: "test-interval",
      selector: "test-selector",
      extra: "test-extra",
      attribute: "test-attribute",
      auxiliary: "test-auxiliary",
      aux: "test-aux",
    });
    expect(component).not.toBe(null);
    expect(component.unknown).toBe(undefined);
    expect(component.interval).toBe("test-interval");
    expect(component.selector).toBe("test-selector");
    expect(component.extra).toBe(undefined);
    expect(component.attribute).toBe("test-attribute");
    expect(component.auxiliary).toBe("test-auxiliary");
    expect(component.aux).toBe(undefined);
  });
});

import { ModelUtils } from "../../src/utils/model-utils.js";

describe("isEmpty", () => {
  test("returns true if input object is empty", () => {
    expect(ModelUtils.isEmpty({})).toBe(true);
  });
  test("returns false if input object is not empty", () => {
    expect(ModelUtils.isEmpty({ test: 1 })).toBe(false);
  });
  test("throws if input object is null", () => {
    expect(() => ModelUtils.isEmpty(null)).toThrow(TypeError);
  });
  test("throws if input object is undefined", () => {
    expect(() => ModelUtils.isEmpty(undefined)).toThrow(TypeError);
  });
});

describe("getValueOrDefault", () => {
  describe("when using valid input value", () => {
    test("returns correct integer", () => {
      expect(ModelUtils.getValueOrDefault(123, 0)).toBe(123);
    });
    test("returns correct float", () => {
      expect(ModelUtils.getValueOrDefault(123.456, 0.0)).toBe(123.456);
    });
    test("returns correct string", () => {
      expect(ModelUtils.getValueOrDefault("str", "")).toBe("str");
    });
    test("returns correct boolean", () => {
      expect(ModelUtils.getValueOrDefault(true, false)).toBe(true);
    });
    test("returns correct object", () => {
      expect(ModelUtils.getValueOrDefault({ prop: 123 }, { default: 0 })).toStrictEqual({ prop: 123 });
    });
  });
  describe("when using undefined input value", () => {
    test("returns default integer", () => {
      expect(ModelUtils.getValueOrDefault(undefined, 0)).toBe(0);
    });
    test("returns default float", () => {
      expect(ModelUtils.getValueOrDefault(undefined, 0.0)).toBe(0.0);
    });
    test("returns default string", () => {
      expect(ModelUtils.getValueOrDefault(undefined, "")).toBe("");
    });
    test("returns default boolean", () => {
      expect(ModelUtils.getValueOrDefault(undefined, false)).toBe(false);
    });
    test("returns default object", () => {
      expect(ModelUtils.getValueOrDefault(undefined, { default: 0 })).toStrictEqual({ default: 0 });
    });
  });
  describe("when using null input value", () => {
    test("returns default integer", () => {
      expect(ModelUtils.getValueOrDefault(null, 0)).toBe(0);
    });
    test("returns default float", () => {
      expect(ModelUtils.getValueOrDefault(null, 0.0)).toBe(0.0);
    });
    test("returns default string", () => {
      expect(ModelUtils.getValueOrDefault(null, "")).toBe("");
    });
    test("returns default boolean", () => {
      expect(ModelUtils.getValueOrDefault(null, false)).toBe(false);
    });
    test("returns default object", () => {
      expect(ModelUtils.getValueOrDefault(null, { default: 0 })).toStrictEqual({ default: 0 });
    });
  });
});

describe("getArrayOfModels", () => {
  class TestClass {
    constructor() {
      this.height = 10;
      this.width = 10;
    }
  }
  test("returns correct array when object match class", () => {
    const inObject = { height: 10, width: 10 };
    const expected = [new TestClass()];
    expect(ModelUtils.getArrayOfModels(TestClass, inObject)).toStrictEqual(expected);
  });
  test("returns empty array when object does not match class", () => {
    const inObject = { h: 10, w: 10 };
    const expected = [];
    expect(ModelUtils.getArrayOfModels(TestClass, inObject)).toStrictEqual(expected);
  });
});

describe("isInstanceOf", () => {
  class TestClass {
    constructor() {
      this.height = 10;
      this.width = 10;
    }
  }
  test("returns true if input object has the same properties as class", () => {
    const inObject = { height: 1, width: 2 };
    expect(ModelUtils.isInstanceOf(TestClass, inObject)).toBe(true);
  });
  test("returns false if input object has different properties as class", () => {
    const inObject = { h: 1, w: 2 };
    expect(ModelUtils.isInstanceOf(TestClass, inObject)).toBe(false);
  });
});

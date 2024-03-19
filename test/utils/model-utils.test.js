import { ModelUtils } from "../../src/utils/model-utils";

describe("isEmpty", () => {
  test("returns true if input object is empty", () => {
    expect(ModelUtils.isEmpty({})).toBe(true);
  });
  test("returns false if input object is not empty", () => {
    expect(ModelUtils.isEmpty({test: 1})).toBe(false);
  });
  test("throws if input object is null", () => {
    expect(() => ModelUtils.isEmpty(null)).toThrow(TypeError);
  });
  test("throws if input object is undefined", () => {
    expect(() => ModelUtils.isEmpty(undefined)).toThrow(TypeError);
  });
});

describe("getValueOrDefault", () => {
  test("returns integer value if input is present", () => {
    expect(ModelUtils.getValueOrDefault(123, 0)).toBe(123);
  });
  test("returns default integer if input is undefined", () => {
    expect(ModelUtils.getValueOrDefault(undefined, 0)).toBe(0);
  });
  test("returns default integer if input is null", () => {
    expect(ModelUtils.getValueOrDefault(null, 0)).toBe(0);
  });
  test("returns object value if input is present", () => {
    expect(ModelUtils.getValueOrDefault({prop: 123}, {default: 0})).toStrictEqual({prop: 123});
  });
  test("returns default object if input is undefined", () => {
    expect(ModelUtils.getValueOrDefault(undefined, {default: 0})).toStrictEqual({default: 0});
  });
  test("returns default object if input is null", () => {
    expect(ModelUtils.getValueOrDefault(null, {default: 0})).toStrictEqual({default: 0});
  });
});

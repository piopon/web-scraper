import { ViewUtils } from "../../src/utils/view-utils.js";

describe("createViewHelpers()", () => {
  const helpers = ViewUtils.createViewHelpers();

  test("returns helper object with expected keys", () => {
    expect(Object.keys(helpers)).toEqual(
      expect.arrayContaining([
        "year",
        "append",
        "and",
        "or",
        "eq",
        "gt",
        "length",
        "unlessEq",
        "split",
        "last",
        "contains",
        "remove",
        "equalsLength",
      ]),
    );
  });

  test("year returns current year", () => {
    expect(helpers.year()).toBe(new Date().getFullYear());
  });

  test("split handles array input, string input and non-string input", () => {
    expect(helpers.split(["a", "b"])).toStrictEqual(["a", "b"]);
    expect(helpers.split("a|b|c")).toStrictEqual(["a", "b", "c"]);
    expect(helpers.split("one|two")).toStrictEqual(["one", "two"]);
    expect(helpers.split("a,b,c", ",")).toStrictEqual(["a", "b", "c"]);
    expect(helpers.split(42)).toStrictEqual([]);
  });

  test("last returns last item for non-empty arrays and empty string otherwise", () => {
    expect(helpers.last(["x", "y", "z"])).toBe("z");
    expect(helpers.last([])).toBe("");
    expect(helpers.last("not-array")).toBe("");
  });

  test("contains and remove handle nullish and mixed-type values", () => {
    expect(helpers.contains("abcdef", "cd")).toBe(true);
    expect(helpers.contains(null, "x")).toBe(false);
    expect(helpers.contains("abc", null)).toBe(true);
    expect(helpers.remove("a-b-c", "-")).toBe("abc");
    expect(helpers.remove(12345, 3)).toBe("1245");
    expect(helpers.remove("abc", null)).toBe("abc");
    expect(helpers.remove(null, "x")).toBe("");
  });

  test("length and equalsLength work with missing length", () => {
    expect(helpers.length([1, 2, 3])).toBe(3);
    expect(helpers.length(undefined)).toBe(0);
    expect(helpers.equalsLength([1, 2], 2)).toBe(true);
    expect(helpers.equalsLength(undefined, 0)).toBe(true);
  });

  test("boolean and comparison helpers return expected values", () => {
    expect(helpers.and(true, true, { hash: {} })).toBe(true);
    expect(helpers.or(false, true, { hash: {} })).toBe(true);
    expect(helpers.eq("x", "x")).toBe(true);
    expect(helpers.unlessEq("x", "y")).toBe(true);
    expect(helpers.gt(3, 2)).toBe(true);
    expect(helpers.append("a", "b", "c", { hash: {} })).toBe("abc");
  });
});

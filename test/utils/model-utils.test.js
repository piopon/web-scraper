import { ModelUtils } from "../../src/utils/model-utils";

describe("isEmpty", () => {
  test("returns true if input object is empty", () => {
    expect(ModelUtils.isEmpty({})).toBe(true);
  });
  test("returns false if input object is not empty", () => {
    expect(ModelUtils.isEmpty({test: 1})).toBe(false);
  });
});

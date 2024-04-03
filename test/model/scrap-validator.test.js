import { ScrapValidator } from "../../src/model/scrap-validator.js";
import { ScrapError, ScrapWarning } from "../../src/model/scrap-exception.js";

describe("validate", () => {
  describe("throws when constructor", () => {
    test("has empty parameter", () => {
      expect(() => new ScrapValidator()).toThrow(ScrapError);
    });
    test("has undefined parameter", () => {
      expect(() => new ScrapValidator(undefined)).toThrow(ScrapError);
    });
    test("has null parameter", () => {
      expect(() => new ScrapValidator(null)).toThrow(ScrapError);
    });
  });
});

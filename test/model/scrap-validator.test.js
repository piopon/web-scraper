import { ScrapValidator } from "../../src/model/scrap-validator.js";
import { ScrapError, ScrapWarning } from "../../src/model/scrap-exception.js";

describe("validate", () => {
  test("throws on empty config input parameter", () => {
    expect(() => new ScrapValidator()).toThrow(ScrapError);
  });
  test("throws on undefined config input parameter", () => {
    expect(() => new ScrapValidator(undefined)).toThrow(ScrapError);
  });
  test("throws on null config input parameter", () => {
    expect(() => new ScrapValidator(null)).toThrow(ScrapError);
  });
});

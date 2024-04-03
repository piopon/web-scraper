import { ScrapValidator } from "../../src/model/scrap-validator.js";
import { ScrapError, ScrapWarning } from "../../src/model/scrap-exception.js";

describe("validate", () => {
  test("throws on empty config input parameter", () => {
    expect(() => new ScrapValidator()).toThrow(ScrapError);
  });
});

import { ScrapError, ScrapWarning } from "../../src/model/scrap-exception.js";

test("scrap error returns correct value fields", () => {
  const error = new ScrapError("test-message")
  expect(error).not.toBe(null);
  expect(error.message).toBe("test-message");
  expect(error.name).toBe("ScrapError");
});

test("scrap error returns correct value fields", () => {
  const warning = new ScrapWarning("test-message")
  expect(warning).not.toBe(null);
  expect(warning.message).toBe("test-message");
  expect(warning.name).toBe("ScrapWarning");
});

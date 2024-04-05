import { LogLevel, ComponentType, ComponentStatus } from "../../config/app-types.js";

describe("LogLevel", () => {
  describe("has correct values for", () => {
    test("level error", () => {
      expect(LogLevel.ERROR.value).toBe(0);
      expect(LogLevel.ERROR.description).toBe("ERROR");
    });
  });
});

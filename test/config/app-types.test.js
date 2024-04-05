import { LogLevel, ComponentType, ComponentStatus } from "../../config/app-types.js";

describe("LogLevel", () => {
  describe("has correct values for", () => {
    test("static type = ERROR", () => {
      expect(LogLevel.ERROR.value).toBe(0);
      expect(LogLevel.ERROR.description).toBe("ERROR");
    });
    test("static type = WARNING", () => {
      expect(LogLevel.WARNING.value).toBe(1);
      expect(LogLevel.WARNING.description).toBe("WARNING");
    });
    test("static type = INFO", () => {
      expect(LogLevel.INFO.value).toBe(2);
      expect(LogLevel.INFO.description).toBe("INFO");
    });
    test("static type = DEBUG", () => {
      expect(LogLevel.DEBUG.value).toBe(3);
      expect(LogLevel.DEBUG.description).toBe("DEBUG");
    });
  });
});

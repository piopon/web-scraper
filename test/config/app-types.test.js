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
  test("returns correct values for custom type", () => {
    const testLogLevel = new LogLevel(123, "TEST");
    expect(testLogLevel.value).toBe(123);
    expect(testLogLevel.description).toBe("TEST");
  });
});

describe("ComponentType", () => {
  describe("has correct values for", () => {
    test("static type = INIT", () => {
      expect(ComponentType.INIT.name).toBe("init");
      expect(ComponentType.INIT.methods).toStrictEqual(["start", "stop"]);
    });
    test("static type = AUTH", () => {
      expect(ComponentType.AUTH.name).toBe("auth");
      expect(ComponentType.AUTH.methods).toStrictEqual(["start", "stop"]);
    });
    test("static type = SLAVE", () => {
      expect(ComponentType.SLAVE.name).toBe("slave");
      expect(ComponentType.SLAVE.methods).toStrictEqual(["getMaster"]);
    });
    test("static type = CONFIG", () => {
      expect(ComponentType.CONFIG.name).toBe("config");
      expect(ComponentType.CONFIG.methods).toStrictEqual(["update"]);
    });
  });
  test("returns correct values for custom type", () => {
    const testComponentType = new ComponentType("test-name", ["test-1", "test-2", "test-3"]);
    expect(testComponentType.name).toBe("test-name");
    expect(testComponentType.methods).toStrictEqual(["test-1", "test-2", "test-3"]);
  });
  describe("equals method", () => {
    test("returns true for identical elements", () => {
      const testComponent1 = new ComponentType("test-name", ["test-1"]);
      const testComponent2 = new ComponentType("test-name", ["test-1"]);
      expect(testComponent1.equals(testComponent2)).toBe(true);
    });
    test("returns false for different names", () => {
      const testComponent1 = new ComponentType("test-name", ["test-1"]);
      const testComponent2 = new ComponentType("test-item", ["test-1"]);
      expect(testComponent1.equals(testComponent2)).toBe(false);
    });
    test("returns false for different methods", () => {
      const testComponent1 = new ComponentType("test-name", ["test-1"]);
      const testComponent2 = new ComponentType("test-name", ["test-2"]);
      expect(testComponent1.equals(testComponent2)).toBe(false);
    });
  });
});

describe("ComponentStatus", () => {
  describe("has correct values for", () => {
    test("static type = STOPPED", () => {
      expect(ComponentStatus.STOPPED.state).toBe("stopped");
    });
  });
});

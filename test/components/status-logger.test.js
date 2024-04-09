import { StatusLogger } from "../../src/components/status-logger.js";
import { LogLevel } from "../../config/app-types.js";

test("getName returns correct result", () => {
  const testLogger = new StatusLogger("test-name", LogLevel.INFO);
  expect(testLogger.getName()).toBe("test-name");
});

describe("debug log", () => {
  test("will appear when min log is equal/lower than LogLevel.DEBUG", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.DEBUG);
    testLogger.debug("test debug log");
    expect(testLogger.getStatus().type).toBe("debug");
    expect(testLogger.getStatus().message).toBe("test debug log");
  });
  test("will NOT appear when min log is higher than LogLevel.DEBUG", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.INFO);
    testLogger.debug("test debug log");
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
  });
});

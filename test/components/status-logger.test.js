import { StatusLogger } from "../../src/components/status-logger.js";
import { LogLevel } from "../../config/app-types.js";

test("getName() returns correct result", () => {
  const testLogger = new StatusLogger("test-name", LogLevel.INFO);
  expect(testLogger.getName()).toBe("test-name");
});

describe("debug() log", () => {
  test("will appear when setting is equal/lower than LogLevel.DEBUG", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.DEBUG);
    testLogger.debug("test debug log");
    expect(testLogger.getStatus().type).toBe("debug");
    expect(testLogger.getStatus().message).toBe("test debug log");
  });
  test("will NOT appear when setting is higher than LogLevel.DEBUG", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.INFO);
    testLogger.debug("test debug log");
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
  });
});

describe("info() log", () => {
  test("will appear when setting is equal/lower than LogLevel.INFO", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.INFO);
    testLogger.info("test info log");
    expect(testLogger.getStatus().type).toBe("info");
    expect(testLogger.getStatus().message).toBe("test info log");
  });
  test("will NOT appear when setting is higher than LogLevel.WARNING", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.WARNING);
    testLogger.info("test info log");
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
  });
});

describe("warning() log", () => {
  test("will appear when setting is equal/lower than LogLevel.WARNING", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.WARNING);
    testLogger.warning("test warning log");
    expect(testLogger.getStatus().type).toBe("warning");
    expect(testLogger.getStatus().message).toBe("test warning log");
  });
  test("will NOT appear when setting is higher than LogLevel.WARNING", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.ERROR);
    testLogger.warning("test warning log");
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
  });
});

describe("error() log", () => {
  test("will appear when setting is equal/lower than LogLevel.ERROR", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.ERROR);
    testLogger.error("test error log");
    expect(testLogger.getStatus().type).toBe("error");
    expect(testLogger.getStatus().message).toBe("test error log");
  });
});

describe("status()", () => {
  test("correctly receives all logs", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.DEBUG);
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
    testLogger.debug("test-log-1");
    expect(testLogger.getStatus().type).toBe("debug");
    expect(testLogger.getStatus().message).toBe("test-log-1");
    testLogger.info("test-log-2");
    expect(testLogger.getStatus().type).toBe("info");
    expect(testLogger.getStatus().message).toBe("test-log-2");
    testLogger.warning("test-log-3");
    expect(testLogger.getStatus().type).toBe("warning");
    expect(testLogger.getStatus().message).toBe("test-log-3");
    testLogger.error("test-log-4");
    expect(testLogger.getStatus().type).toBe("error");
    expect(testLogger.getStatus().message).toBe("test-log-4");
  });
  test("correctly filters logs for specified setting", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.WARNING);
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
    testLogger.debug("test-log-1");
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
    testLogger.info("test-log-2");
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
    testLogger.warning("test-log-3");
    expect(testLogger.getStatus().type).toBe("warning");
    expect(testLogger.getStatus().message).toBe("test-log-3");
    testLogger.error("test-log-4");
    expect(testLogger.getStatus().type).toBe("error");
    expect(testLogger.getStatus().message).toBe("test-log-4");
  });
});

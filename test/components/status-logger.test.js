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
  test("will appear only once when message has the same text and DEBUG type", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.DEBUG);
    testLogger.debug("test debug log");
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
  test("will NOT appear when setting has invalid smaller value", () => {
    const testLogger = new StatusLogger("test-name", { value: -1 });
    testLogger.error("test error log");
    expect(testLogger.getStatus().type).toBe("");
    expect(testLogger.getStatus().message).toBe("No status logged yet");
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

describe("getHistory()", () => {
  test("correctly receives all logs", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.DEBUG);
    testLogger.debug("test-log-1");
    testLogger.info("test-log-2");
    testLogger.warning("test-log-3");
    testLogger.error("test-log-4");
    const result = testLogger.getHistory();
    expect(result.length).toBe(4);
    expect(result[0].type).toBe("debug");
    expect(result[0].message).toBe("test-log-1");
    expect(result[1].type).toBe("info");
    expect(result[1].message).toBe("test-log-2");
    expect(result[2].type).toBe("warning");
    expect(result[2].message).toBe("test-log-3");
    expect(result[3].type).toBe("error");
    expect(result[3].message).toBe("test-log-4");
  });
  test("correctly receives logs depending on min level", () => {
    const testLogger = new StatusLogger("test-name", LogLevel.ERROR);
    testLogger.debug("test-log-1");
    testLogger.error("test-log-2");
    testLogger.info("test-log-3");
    testLogger.warning("test-log-4");
    testLogger.error("test-log-5");
    const result = testLogger.getHistory();
    expect(result.length).toBe(2);
    expect(result[0].type).toBe("error");
    expect(result[0].message).toBe("test-log-2");
    expect(result[1].type).toBe("error");
    expect(result[1].message).toBe("test-log-5");
  });
});

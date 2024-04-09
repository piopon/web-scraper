import { StatusLogger } from "../../src/components/status-logger.js";
import { LogLevel } from "../../config/app-types.js";

test("getName returns correct result", () => {
  const testLogger = new StatusLogger("test-name", LogLevel.INFO);
  expect(testLogger.getName()).toBe("test-name");
});

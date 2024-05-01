import { WebDatabase } from "../../src/components/web-database.js";
import { LogLevel } from "../../config/app-types.js";

test("getName() returns correct result", () => {
  const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
  expect(testDatabase.getName()).toBe("web-database  ");
});

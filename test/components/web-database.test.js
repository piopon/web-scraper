import { WebDatabase } from "../../src/components/web-database.js";
import { LogLevel } from "../../config/app-types.js";

describe("getName()", () => {
  test("returns correct result when log level is defined", () => {
    const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
    expect(testDatabase.getName()).toBe("web-database  ");
  });
  test("throws when no log level is defined", () => {
    expect(() => new WebDatabase()).toThrow(TypeError);
  });
});

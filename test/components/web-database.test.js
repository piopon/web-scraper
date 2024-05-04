import { WebDatabase } from "../../src/components/web-database.js";
import { ComponentType, LogLevel } from "../../config/app-types.js";

describe("creating an object", () => {
  test("instantiates a new object when input object is correct", () => {
    const inputObject = { minLogLevel: LogLevel.INFO };
    expect(() => new WebDatabase(inputObject)).not.toThrow(Error);
  });
  test("throws when no log level is defined", () => {
    const inputObject = {};
    expect(() => new WebDatabase(inputObject)).toThrow(TypeError);
  });
  test("throws when input object is undefined", () => {
    const inputObject = undefined;
    expect(() => new WebDatabase(inputObject)).toThrow(TypeError);
  });
  test("throws when input object is null", () => {
    const inputObject = null;
    expect(() => new WebDatabase(inputObject)).toThrow(TypeError);
  });
});

test("getName() returns correct result", () => {
  const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
  expect(testDatabase.getName()).toBe("web-database  ");
});

test("getInfo() returns correct result", () => {
  const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
  const infoObject = testDatabase.getInfo();
  expect(infoObject).not.toBe(undefined);
  expect(infoObject.types).toStrictEqual([ComponentType.INIT]);
  expect(infoObject.initWait).toBe(false);
});
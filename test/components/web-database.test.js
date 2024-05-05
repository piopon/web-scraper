import { WebDatabase } from "../../src/components/web-database.js";
import { ComponentType, LogLevel } from "../../config/app-types.js";

import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.mock("mongoose");

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

describe("start() method", () => {
  test("succeeds with valid input data", async () => {
    const configObject = {
      url: "test-url",
      port: 1234,
      name: "test-name",
      user: "user-name",
      password: "pass",
      timeout: 1_000,
    };
    const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO, databaseConfig: configObject });
    const mongooseConnectSpyOn = jest
      .spyOn(mongoose, "connect")
      .mockImplementationOnce(() => Promise.resolve(mongoose));
    const result = await testDatabase.start();
    expect(result).toBe(true);
    const expectedUrl = "mongodb://test-url:1234";
    const expectedObj = {
      appName: configObject.name,
      dbName: configObject.name,
      user: configObject.user,
      pass: configObject.password,
      serverSelectionTimeoutMS: configObject.timeout,
      connectTimeoutMS: configObject.timeout,
      family: 4,
    };
    expect(mongooseConnectSpyOn).toBeCalledWith(expectedUrl, expectedObj);
  });
  test("fails with invalid input data", async () => {
    const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
    const result = await testDatabase.start();
    expect(result).toBe(false);
  });
});

test("stop() does not throw error", async () => {
  const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO});
  expect(() => testDatabase.stop()).not.toThrow();
});

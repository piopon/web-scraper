import { WebDatabase } from "../../src/components/web-database.js";
import { ComponentType, ComponentStatus, LogLevel } from "../../src/config/app-types.js";
import { ScrapConfig } from "../../src/model/scrap-config.js";
import { ScrapUser } from "../../src/model/scrap-user.js";

import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.mock("mongoose");
jest.mock("../../src/model/scrap-config.js");
jest.mock("../../src/model/scrap-user.js");

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
  expect(infoObject.initWait).toBe(true);
});

describe("start() method", () => {
  test("succeeds with valid input data", async () => {
    const mockConfigResult = { countDocuments: () => 1 };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockConfigResult);
    const mockUserResult = { countDocuments: () => 1, deleteMany: (_) => ({ deletedCount: 0 }) };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => mockUserResult);
    const mongooseConnectSpyOn = jest
      .spyOn(mongoose, "connect")
      .mockImplementationOnce(() => Promise.resolve(mongoose));
    const configObject = {
      url: "test-url",
      port: 1234,
      name: "test-name",
      user: "user-name",
      password: "pass",
      timeout: 1_000,
    };
    const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO, databaseConfig: configObject });
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
  const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
  expect(() => testDatabase.stop()).not.toThrow();
});

describe("getStatus() returns correct result", () => {
  const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
  test("when ready state is equal to disconnected (0)", async () => {
    jest.spyOn(mongoose, "connection", "get").mockReturnValue({ readyState: 0 });
    expect(testDatabase.getStatus()).toBe(ComponentStatus.STOPPED);
  });
  test("when ready state is equal to connected (1)", async () => {
    jest.spyOn(mongoose, "connection", "get").mockReturnValue({ readyState: 1 });
    expect(testDatabase.getStatus()).toBe(ComponentStatus.RUNNING);
  });
  test("when ready state is equal to connecting (2)", async () => {
    jest.spyOn(mongoose, "connection", "get").mockReturnValue({ readyState: 2 });
    expect(testDatabase.getStatus()).toBe(ComponentStatus.INITIALIZING);
  });
  test("when ready state is equal to disconnecting (3)", async () => {
    jest.spyOn(mongoose, "connection", "get").mockReturnValue({ readyState: 3 });
    expect(testDatabase.getStatus()).toBe(ComponentStatus.STOPPED);
  });
  test("when ready state is equal to uninitialized (99)", async () => {
    jest.spyOn(mongoose, "connection", "get").mockReturnValue({ readyState: 99 });
    expect(testDatabase.getStatus()).toBe(ComponentStatus.STOPPED);
  });
});

describe("getHistory() returns correct result", () => {
  test("after creating object", async () => {
    const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
    const result = testDatabase.getHistory();
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("info");
    expect(result[0].message).toBe("Created");
  });
  test("after incorrect object start", async () => {
    const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO });
    jest.spyOn(mongoose, "connect").mockImplementationOnce(() => Promise.resolve(mongoose));
    await testDatabase.start();
    const result = testDatabase.getHistory();
    expect(result.length).toBe(2);
    expect(result[0].type).toBe("info");
    expect(result[0].message).toBe("Created");
    expect(result[1].type).toBe("error");
    expect(result[1].message).toBe("Cannot read properties of undefined (reading 'url')");
  });
  test("after correct object start", async () => {
    const configObject = { url: "test-url", port: 1234 };
    const testDatabase = new WebDatabase({ minLogLevel: LogLevel.INFO, databaseConfig: configObject });
    jest.spyOn(mongoose, "connect").mockImplementationOnce(() => Promise.resolve(mongoose));
    await testDatabase.start();
    const result = testDatabase.getHistory();
    expect(result.length).toBe(2);
    expect(result[0].type).toBe("info");
    expect(result[0].message).toBe("Created");
    expect(result[1].type).toBe("info");
    expect(result[1].message).toBe("Connected to database");
  });
});

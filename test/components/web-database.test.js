import { WebDatabase } from "../../src/components/web-database.js";
import { ComponentType, ComponentStatus, LogLevel } from "../../src/config/app-types.js";
import { ScrapConfig } from "../../src/model/scrap-config.js";
import { ScrapUser } from "../../src/model/scrap-user.js";

import { jest } from "@jest/globals";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

jest.mock("fs");
jest.mock("path");
jest.mock("bcrypt");
jest.mock("mongoose");
jest.mock("../../src/model/scrap-config.js");
jest.mock("../../src/model/scrap-user.js");

process.env.DEMO_BASE = "demo@user.com";
process.env.DEMO_PASS = "demo_pass";
process.env.CI_USER = "ci@user.com";
process.env.CI_PASS = "ci_pass";

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
  const configObject = {
    url: "test-url",
    port: 1234,
    name: "test-name",
    user: "user-name",
    password: "pass",
    timeout: 1_000,
  };
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
  const testDatabase = new WebDatabase({
    minLogLevel: LogLevel.INFO,
    databaseConfig: configObject,
    usersDataConfig: { path: "" },
    authConfig: { hashSalt: 10 },
    jsonDataConfig: { path: "", config: "" }
  });
  const mongooseConnectSpyOn = jest.spyOn(mongoose, "connect").mockImplementation(() => Promise.resolve(mongoose));
  test("succeeds with valid input data", async () => {
    // prepare post-start maintenance logic to be as impactless as possible
    jest.spyOn(fs, "existsSync").mockImplementation((_) => true);
    jest.spyOn(path, "join").mockImplementation((_) => "");
    const mockConfigResult = { countDocuments: () => 1 };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockConfigResult);
    const mockUserResult = { findOne: (_) => true, countDocuments: () => 1, deleteMany: (_) => ({ deletedCount: 0 }) };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => mockUserResult);
    // invoke the core test logic
    const result = await testDatabase.start();
    expect(result).toBe(true);
    expect(mongooseConnectSpyOn).toBeCalledWith(expectedUrl, expectedObj);
  });
  test("creates base demo user when not found", async () => {
    // prepare post-start maintenance logic to semi-impactless (go through demo user logic)
    jest.spyOn(bcrypt, "hashSync").mockResolvedValue("pass@test");
    jest.spyOn(path, "join").mockImplementation((_) => "");
    jest.spyOn(fs, "existsSync").mockImplementation((_) => true);
    jest.spyOn(fs, "readFileSync").mockImplementation((_) => `{ "test": "value" }`);
    const mockConfigResult = { create: (_) => ({ _id: 1, save: () => true }), countDocuments: () => 1 };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockConfigResult);
    const mockUserResult = {
      create: (_) => ({ _id: 100, save: () => true }),
      findOne: (user) => (process.env.DEMO_BASE === user.email ? null : true),
      countDocuments: () => 1,
      deleteMany: (_) => ({ deletedCount: 0 }),
    };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => mockUserResult);
    // invoke the core test logic
    const result = await testDatabase.start();
    expect(result).toBe(true);
    expect(mongooseConnectSpyOn).toBeCalledWith(expectedUrl, expectedObj);
  });
  test("creates CI user when not found", async () => {
    // prepare post-start maintenance logic to semi-impactless (go through demo user logic)
    jest.spyOn(bcrypt, "hashSync").mockResolvedValue("pass@test");
    jest.spyOn(path, "join").mockImplementation((_) => "");
    jest.spyOn(fs, "existsSync").mockImplementation((_) => true);
    jest.spyOn(fs, "readFileSync").mockImplementation((_) => `{ "test": "value" }`);
    const mockConfigResult = { create: (_) => ({ _id: 1, save: () => true }), countDocuments: () => 1 };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockConfigResult);
    const mockUserResult = {
      create: (_) => ({ _id: 100, save: () => true }),
      findOne: (user) => (process.env.CI_USER === user.email ? null : true),
      countDocuments: () => 1,
      deleteMany: (_) => ({ deletedCount: 0 }),
    };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => mockUserResult);
    // invoke the core test logic
    const result = await testDatabase.start();
    expect(result).toBe(true);
    expect(mongooseConnectSpyOn).toBeCalledWith(expectedUrl, expectedObj);
  });
  test("creates CI data when not present", async () => {
    // prepare post-start maintenance logic to be as impactless as possible
    jest.spyOn(path, "join").mockImplementation((_) => "");
    jest.spyOn(fs, "existsSync").mockImplementation((_) => false);
    const mockConfigResult = { countDocuments: () => 1 };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockConfigResult);
    const mockUserResult = { findOne: (_) => true, countDocuments: () => 1, deleteMany: (_) => ({ deletedCount: 0 }) };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => mockUserResult);
    // invoke the core test logic
    const result = await testDatabase.start();
    expect(result).toBe(true);
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
    // prepare post-start maintenance logic to be as impactless as possible
    jest.spyOn(fs, "existsSync").mockImplementation((_) => true);
    jest.spyOn(path, "join").mockImplementation((_) => "");
    jest.spyOn(mongoose, "connect").mockImplementation(() => Promise.resolve(mongoose));
    const mockConfigResult = { countDocuments: () => 1 };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockConfigResult);
    const mockUserResult = { findOne: (_) => true, countDocuments: () => 1, deleteMany: (_) => ({ deletedCount: 0 }) };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => mockUserResult);
    // invoke the core test logic
    const configObject = { url: "test-url", port: 1234 };
    const testDatabase = new WebDatabase({
      minLogLevel: LogLevel.INFO,
      databaseConfig: configObject,
      usersDataConfig: { path: "" },
    });
    await testDatabase.start();
    const result = testDatabase.getHistory();
    expect(result.length).toBe(3);
    expect(result[0].type).toBe("info");
    expect(result[0].message).toBe("Created");
    expect(result[1].type).toBe("info");
    expect(result[1].message).toBe("Connected to database");
    expect(result[2].type).toBe("info");
    expect(result[2].message).toBe("Maintenance summary: 0 configs, 0 demos");
  });
});

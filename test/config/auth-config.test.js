import { WebComponents } from "../../src/components/web-components";
import { ComponentType, LogLevel } from "../../src/config/app-types";
import { AuthConfig } from "../../src/config/auth-config";
import { ScrapUser } from "../../src/model/scrap-user.js";
import { ScrapConfig } from "../../src/model/scrap-config.js";

import bcrypt from "bcrypt";
import passport from "passport";
import { jest } from "@jest/globals";
import { MongooseError, Error as MongooseNamespace } from "mongoose";

jest.mock("bcrypt");
jest.mock("../../src/model/scrap-user.js");
jest.mock("../../src/model/scrap-config.js");

process.env.JWT_SECRET = "test_secret";
process.env.GOOGLE_CLIENT_ID = "test_id";

test("configure returns correct result", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const authConfig = new AuthConfig(passport, components);
  const result = authConfig.configure();
  expect(Object.hasOwn(result._strategies, "jwt")).toBe(true);
  expect(Object.hasOwn(result._strategies, "google")).toBe(true);
  expect(Object.hasOwn(result._strategies, "local-login")).toBe(true);
  expect(Object.hasOwn(result._strategies, "local-register")).toBe(true);
});

describe("auth object serializes user", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const authConfig = new AuthConfig(passport, components);
  const authObj = authConfig.configure();
  test("with correct result when user is valid", () => {
    let resultErr = "initial-err";
    let resultUsr = "initial-usr";
    const expectedId = 1;
    authObj.serializeUser({ _id: expectedId }, (err, usr) => {
      resultErr = err;
      resultUsr = usr;
    });
    expect(resultErr).toBe(null);
    expect(resultUsr).toBe(expectedId);
  });
  test("with error when user is invalid", () => {
    let resultErr = "initial-err";
    let resultUsr = "initial-usr";
    authObj.serializeUser({ name: "invalid" }, (err, usr) => {
      resultErr = err;
      resultUsr = usr;
    });
    expect(resultErr).not.toBe(null);
    expect(resultErr.message).toBe("Failed to serialize user into session");
    expect(resultUsr).toBe(undefined);
  });
});

describe("auth object deserializes user", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const authConfig = new AuthConfig(passport, components);
  const authObj = authConfig.configure();
  test("with correct result when ID is valid", async () => {
    const expectedUser = { _id: 1, name: "test" };
    const mock = () => ({ findById: (_) => expectedUser });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
    const result = await new Promise((resolve, reject) => {
      authObj.deserializeUser(1, (err, usr) => {
        if (err) reject(err);
        else resolve(usr);
      });
    });
    expect(result).toEqual(expectedUser);
  });
  test("with error when ID is invalid", async () => {
    const expectedErr = "User not found";
    const mock = () => ({ findById: (_) => null });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
    try {
      await new Promise((resolve, reject) => {
        authObj.deserializeUser(1, (err, usr) => {
          if (err || !usr) reject(expectedErr);
          else resolve(usr);
        });
      });
    } catch (error) {
      expect(error).toBe(expectedErr);
    }
  });
});

describe("auth object with jwt strategy", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const authConfig = new AuthConfig(passport, components);
  const authObj = authConfig.configure();
  const testVerify = authObj._strategies["jwt"]._verify;
  test("correctly authenticates user when data are correct", async () => {
    doneMock = jest.fn();
    const mockUser = { name: "name", email: "name@te.st", password: "pass@test", save: () => true };
    const mock = () => ({ findOne: (_) => mockUser });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
    await testVerify({}, doneMock);
    expect(doneMock).toHaveBeenCalledWith(null, mockUser);
  });
  describe("fails to authenticate user when", () => {
    test("data is incorrect", async () => {
      doneMock = jest.fn();
      const mock = () => ({ findOne: (_) => undefined });
      jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
      await testVerify({}, doneMock);
      expect(doneMock).toHaveBeenCalledWith(null, false, { message: "Incorrect token." });
    });
    test("internal issues are present", async () => {
      const expectedErr = "Mocked DB error!";
      doneMock = jest.fn();
      const mock = () => ({
        findOne: (_) => {
          throw Error(expectedErr);
        },
      });
      jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
      await testVerify({}, doneMock);
      expect(doneMock).toHaveBeenCalledWith(null, false, { message: expectedErr });
    });
  });
});

describe("auth object with local-login strategy", () => {
  test("correctly authenticates user when config and data are correct", async () => {
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const authConfig = new AuthConfig(passport, components);
    const authObj = authConfig.configure();
    const testVerify = authObj._strategies["local-login"]._verify;
    doneMock = jest.fn();
    const mockUsers = [{ name: "name", email: "name@te.st", password: "pass@test", save: () => true }];
    const mock = () => ({ find: (_) => mockUsers });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    await testVerify("name@te.st", "pass@test", doneMock);
    expect(doneMock).toHaveBeenCalledWith(null, mockUsers[0]);
  });
  describe("fails to authenticate user when config is correct but", () => {
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    components.addComponent({
      getInfo: () => ({ types: [ComponentType.AUTH], initWait: true }),
      getName: () => "test-component",
      start: () => false,
      stop: () => true,
    });
    const authConfig = new AuthConfig(passport, components);
    const authObj = authConfig.configure();
    const testVerify = authObj._strategies["local-login"]._verify;
    test("multiple users were found", async () => {
      doneMock = jest.fn();
      const mockUsers = [{ name: "name1" }, { name: "name2" }];
      const mock = () => ({ find: (_) => mockUsers });
      jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      await testVerify("name@te.st", "pass@test", doneMock);
      expect(doneMock).toHaveBeenCalledWith(null, false, { message: "Incorrect login data. Please try again." });
    });
    test("password is incorrect", async () => {
      doneMock = jest.fn();
      const mockUsers = [{ name: "name", email: "name@te.st", password: "pass@test", save: () => true }];
      const mock = () => ({ find: (_) => mockUsers });
      jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
      await testVerify("name@te.st", "pass@test", doneMock);
      expect(doneMock).toHaveBeenCalledWith(null, false, { message: "Incorrect login data. Please try again." });
    });
    test("auth components cannot be started", async () => {
      doneMock = jest.fn();
      const mockUsers = [{ name: "name", email: "name@te.st", password: "pass@test" }];
      const mock = () => ({ find: (_) => mockUsers });
      jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      await testVerify("name@te.st", "pass@test", doneMock);
      expect(doneMock).toHaveBeenCalledWith(null, false, {
        message: "Cannot start authenticate components. Please try again.",
      });
    });
    describe("database error occurs", () => {
      test("due to broken connection", async () => {
        doneMock = jest.fn();
        jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(() => ({
          find: (_) => {
            throw Error("ECONNREFUSED");
          },
        }));
        await testVerify("name@te.st", "pass@test", doneMock);
        expect(doneMock).toHaveBeenCalledWith(null, false, {
          message: "Database connection has been broken. Check connection status and please try again.",
        });
      });
      test("due to timed out connection", async () => {
        doneMock = jest.fn();
        jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(() => ({
          find: (_) => {
            throw new MongooseError("ERR: MongoDB.find() take too long to complete");
          },
        }));
        await testVerify("name@te.st", "pass@test", doneMock);
        expect(doneMock).toHaveBeenCalledWith(null, false, {
          message: "Database connection has timed out. Check connection status and please try again.",
        });
      });
      test("due to failed validation", async () => {
        doneMock = jest.fn();
        const expectedErr = "Validation failed.";
        jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(() => ({
          find: (_) => {
            const mockError = new MongooseNamespace.ValidationError(new MongooseError("ERR"));
            mockError.addError("test-path", new MongooseNamespace.ValidatorError({ message: expectedErr }));
            throw mockError;
          },
        }));
        await testVerify("name@te.st", "pass@test", doneMock);
        expect(doneMock).toHaveBeenCalledWith(null, false, { message: expectedErr });
      });
    });
  });
  test("fails to authenticate user when config is incorrect", async () => {
    const authConfig = new AuthConfig(passport, null);
    const authObj = authConfig.configure();
    const testVerify = authObj._strategies["local-login"]._verify;
    doneMock = jest.fn();
    const mockUsers = [{ name: "name", email: "name@te.st", password: "pass@test", save: () => true }];
    const mock = () => ({ find: (_) => mockUsers });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(mock);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    await testVerify("name@te.st", "pass@test", doneMock);
    expect(doneMock).toHaveBeenCalledWith(null, false, {
      message: "Cannot read properties of null (reading 'initComponents')",
    });
  });
});

describe("auth object with local-register strategy", () => {
  const authConfig = new AuthConfig(passport, undefined, { hashSalt: 10 });
  const authObj = authConfig.configure();
  const testVerify = authObj._strategies["local-register"]._verify;
  test("correctly registers new user when config and data are correct", async () => {
    doneMock = jest.fn();
    const expectedUser = { _id: 1, name: "name", email: "name@te.st", password: "pass@test", save: () => true };
    const mockRequest = { body: { name: "name" } };
    const mockUser = () => ({ find: (_) => [], create: (_) => expectedUser });
    const mockConfig = () => ({ create: () => ({ _id: 100 }) });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(mockUser);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(mockConfig);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("pass@test");
    await testVerify(mockRequest, "new@usr.tst", "pass4new", doneMock);
    expect(doneMock).toHaveBeenCalledWith(null, expectedUser);
  });
  test("doesn't register user already existing", async () => {
    doneMock = jest.fn();
    const mockUsers = [{ _id: 1, name: "name", email: "name@te.st", password: "pass@test", save: () => true }];
    const mockUser = () => ({ find: (_) => mockUsers });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(mockUser);
    await testVerify(undefined, "new@usr.tst", "pass4new", doneMock);
    expect(doneMock).toHaveBeenCalledWith(null, false, {
      message: "Provided email is already in use. Please try again.",
    });
  });
  describe("fails when database error occurs", () => {
    test("due to connection break", async () => {
      doneMock = jest.fn();
      jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(() => ({
        find: (_) => {
          throw Error("ECONNREFUSED");
        },
      }));
      await testVerify(undefined, "new@usr.tst", "pass4new", doneMock);
      expect(doneMock).toHaveBeenCalledWith(null, false, {
        message: "Database connection has been broken. Check connection status and please try again.",
      });
    });
    test("due to connection timeout", async () => {
      doneMock = jest.fn();
      jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(() => ({
        find: (_) => {
          throw new MongooseError("ERR: MongoDB.find() take too long to complete");
        },
      }));
      await testVerify(undefined, "new@usr.tst", "pass4new", doneMock);
      expect(doneMock).toHaveBeenCalledWith(null, false, {
        message: "Database connection has timed out. Check connection status and please try again.",
      });
    });
    test("due to incorrect validation", async () => {
      doneMock = jest.fn();
      const expectedErr = "Validation failed.";
      jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementationOnce(() => ({
        find: (_) => {
          const mockError = new MongooseNamespace.ValidationError(new MongooseError("ERR"));
          mockError.addError("test-path", new MongooseNamespace.ValidatorError({ message: expectedErr }));
          throw mockError;
        },
      }));
      await testVerify(undefined, "new@usr.tst", "pass4new", doneMock);
      expect(doneMock).toHaveBeenCalledWith(null, false, { message: expectedErr });
    });
  });
});

describe("auth object with google strategy", () => {
  const authConfig = new AuthConfig(passport, undefined, { hashSalt: 10 });
  const authObj = authConfig.configure();
  const testVerify = authObj._strategies["google"]._verify;
  const expectedUser = { _id: 1, name: "name", email: "name@te.st", password: "pass@test", save: () => true };
  const mockGoogleProfile = { displayName: "name", emails: [{ value: "name@te.st" }] };
  test("correctly logins user when exists in database", async () => {
    doneMock = jest.fn();
    const mockUser = () => ({ findOne: (_) => expectedUser });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(mockUser);
    await testVerify(undefined, undefined, undefined, mockGoogleProfile, doneMock);
    expect(doneMock).toHaveBeenCalledWith(null, expectedUser);
  });
  test("correctly creates new user when not existing in database", async () => {
    doneMock = jest.fn();
    const mockUser = () => ({ findOne: (_) => undefined, create: (_) => expectedUser });
    const mockConfig = () => ({ create: () => ({ _id: 100 }) });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(mockUser);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(mockConfig);
    await testVerify(undefined, undefined, undefined, mockGoogleProfile, doneMock);
    expect(doneMock).toHaveBeenCalledWith(null, expectedUser);
  });
});

describe("auth object with local-demo strategy", () => {
  test("correctly detects that demo features is not enabled", async () => {
    const authConfig = new AuthConfig(passport, undefined, { hashSalt: 10 });
    const authObj = authConfig.configure();
    const testVerify = authObj._strategies["local-demo"]._verify;
    doneMock = jest.fn();
    const mockUser = () => ({ findOne: (_) => [] });
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(mockUser);
    await testVerify("email", "pass", doneMock);
    expect(doneMock).toHaveBeenCalledWith(null, false, { message: "Demo functionality is not enabled." });
  });
});
import { WebComponents } from "../../src/components/web-components";
import { LogLevel } from "../../src/config/app-types";
import { AuthConfig } from "../../src/config/auth-config";
import { ScrapUser } from "../../src/model/scrap-user.js";

import passport from "passport";
import { jest } from "@jest/globals";

jest.mock("../../src/model/scrap-user.js");

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

describe("auth object correctly authenticates user", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const authConfig = new AuthConfig(passport, components);
  const authObj = authConfig.configure();
  test("configure returns correct result", () => {
    const jwtOpts = { successRedirect: "/success", failureRedirect: "/failure" };
    let redirectRes = "";
    let res = { redirect: (to) => (redirectRes = to) };
    authObj.authenticate("local-login", jwtOpts)({}, res, () => {});
    expect(redirectRes).toBe("/failure");
  });
});

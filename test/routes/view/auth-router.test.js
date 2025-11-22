import { AuthConfig } from "../../../src/config/auth-config.js";
import { AuthRouter } from "../../../src/routes/view/auth-router.js";
import { ScrapConfig } from "../../../src/model/scrap-config.js";
import { ScrapUser } from "../../../src/model/scrap-user.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../src/config/app-types.js";

import bcrypt from "bcrypt";
import supertest from "supertest";
import passport from "passport";
import express from "express";
import flash from "express-flash";
import session from "express-session";
import helpers from "handlebars-helpers";
import jsonwebtoken from "jsonwebtoken";
import { jest } from "@jest/globals";
import { engine } from "express-handlebars";

jest.mock("../../../src/model/scrap-config.js");
jest.mock("../../../src/model/scrap-user.js");
jest.mock("jsonwebtoken");
jest.mock("passport");
jest.mock("bcrypt");

let isAuthenticatedResult = false;

process.env.JWT_SECRET = "test_secret";
process.env.DEMO_USER = "test_user";
process.env.DEMO_PASS = "test_pass";
process.env.GOOGLE_CLIENT_ID = "test_id";
process.env.GOOGLE_CLIENT_SECRET = "test_secret";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/register", method: "get" },
      { path: "/login", method: "get" },
      { path: "/token", method: "get" },
      { path: "/google", method: "get" },
      { path: "/google/callback", method: "get" },
      { path: "/register", method: "post" },
      { path: "/login", method: "post" },
      { path: "/token", method: "post" },
      { path: "/demo", method: "post" },
      { path: "/logout", method: "post" },
    ];
    const testRouter = new AuthRouter(passport);
    const createdRoutes = testRouter.createRoutes();
    expect(createdRoutes.stack.length).toBe(expectedRoutes.length);
    createdRoutes.stack
      .map((stackRoute) => stackRoute.route)
      .forEach((route) => {
        const foundRoutesNo = expectedRoutes.filter((expected) => {
          const samePath = expected.path === route.path;
          const hasMethod = Object.keys(route.methods).includes(expected.method);
          return samePath && hasMethod;
        }).length;
        expect(foundRoutesNo).toBe(1);
      });
  });
});

describe("created auth GET routes", () => {
  const testRouter = new AuthRouter(passport);
  const testApp = configureTestSever(testRouter);
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.get("/auth/unknown");
    expect(response.statusCode).toBe(404);
  });
  test("returns correct result using /register endpoint", async () => {
    isAuthenticatedResult = false;
    const response = await testAgent.get("/auth/register");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("text/html");
    expect(response.text).toEqual(expect.not.arrayContaining(["", null, undefined]));
    expect(response.text).toContain("<h3>scraper user registration</h3>");
    expect(response.text).toContain('<p class="user-title">create your account.</p>');
    expect(response.text).toContain('<input type="text" id="user-name" name="name" required>');
    expect(response.text).toContain('<input type="email" id="user-email" name="email" required>');
    expect(response.text).toContain('<input type="password" id="user-password" name="password" required>');
    expect(response.text).toContain('<i class="fa fa-check-square-o"></i>register');
    expect(response.text).toContain('<p>already registered? go to <a href="/auth/login">login</a> page</p>');
  });
  test("returns correct result using /login endpoint", async () => {
    isAuthenticatedResult = false;
    const response = await testAgent.get("/auth/login");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("text/html");
    expect(response.text).toEqual(expect.not.arrayContaining(["", null, undefined]));
    expect(response.text).toContain("<h3>scraper user login</h3>");
    expect(response.text).toContain('<p class="user-title">welcome back.</p>');
    expect(response.text).toContain('<input type="email" id="user-email" name="email" required>');
    expect(response.text).toContain('<input type="password" id="user-password" name="password" required>');
    expect(response.text).toContain('<i class="fa fa-sign-in"></i> login with email');
    expect(response.text).toContain('<p>not registered? go to <a href="/auth/register">register</a> page.</p>');
  });
  test("returns correct result using /token endpoint", async () => {
    isAuthenticatedResult = true;
    jest.spyOn(jsonwebtoken, "sign").mockReturnValue("mocked.jwt.token");
    const response = await testAgent.get("/auth/token");
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ token: "mocked.jwt.token" });
  });
  test("returns correct result using /google endpoint", async () => {
    isAuthenticatedResult = false;
    const response = await testAgent.get("/auth/google");
    expect(response.statusCode).toBe(302);
    expect(response.text).toBe("");
  });
  test("returns correct result using /google/callback endpoint", async () => {
    isAuthenticatedResult = true;
    jest.spyOn(passport, "authenticate").mockImplementation((strategy, options) => {
      return (req, res, next) => {
        next();
      };
    });
    // we need to create a LOCAL agent in order for the passport mockup to be applied correctly
    // also we aren't moving this mockup, because other tests should use the real implementation
    const localAgent = supertest.agent(configureTestSever(testRouter));
    const response = await localAgent.get("/auth/google/callback");
    expect(response.statusCode).toBe(302);
    expect(response.text).toBe("Found. Redirecting to /");
    expect(response.headers.location).toBe("/");
  });
});

describe("created auth POST routes", () => {
  const testRouter = new AuthRouter(passport, new WebComponents({ minLogLevel: LogLevel.DEBUG }), { hashSalt: 10 });
  const testApp = configureTestSever(testRouter);
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  test("returns correct result for unknown path", async () => {
    isAuthenticatedResult = false;
    const response = await testAgent.post("/auth/unknown");
    expect(response.statusCode).toBe(404);
  });
  test("returns correct result using /register endpoint", async () => {
    isAuthenticatedResult = false;
    const response = await testAgent.post("/auth/register");
    expect(response.statusCode).toBe(302);
    expect(response.text).toBe("Found. Redirecting to /auth/register");
    expect(response.headers.location).toBe("/auth/register");
  });
  test("returns correct result using /login endpoint", async () => {
    isAuthenticatedResult = false;
    const response = await testAgent.post("/auth/login");
    expect(response.statusCode).toBe(302);
    expect(response.text).toBe("Found. Redirecting to /auth/login");
    expect(response.headers.location).toBe("/auth/login");
  });
  test("returns correct result using /demo endpoint", async () => {
    isAuthenticatedResult = false;
    const response = await testAgent.post("/auth/demo");
    expect(response.statusCode).toBe(302);
    expect(response.text).toBe("Found. Redirecting to /auth/login");
    expect(response.headers.location).toBe("/auth/login");
  });
  test("returns correct result using /token endpoint", async () => {
    isAuthenticatedResult = false;
    jest.spyOn(passport, "authenticate").mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        return callback(undefined, { name: "test", email: "mail", password: "pass" }, {});
      };
    });
    const payload = { email: "email", password: "pass" };
    const response = await testAgent.post("/auth/token").send(payload);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(JSON.stringify({ token: "mocked.jwt.token", challenge: {} }));
  });
  test("returns info message error using /token endpoint", async () => {
    isAuthenticatedResult = false;
    const expectedErrorMsg = "Cannot find user with challenge";
    jest.spyOn(passport, "authenticate").mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        return callback(undefined, undefined, { message: expectedErrorMsg });
      };
    });
    const payload = { email: "email", password: "pass" };
    const response = await testAgent.post("/auth/token").send(payload);
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ error: expectedErrorMsg }));
  });
  test("returns invalid token access fields error using /token endpoint", async () => {
    isAuthenticatedResult = false;
    jest.spyOn(passport, "authenticate").mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        return callback(undefined, { name: "test", email: "mail", password: "pass" }, {});
      };
    });
    const payload = { unknown: "email", field: "pass" };
    const response = await testAgent.post("/auth/token").send(payload);
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ error: "Invalid token access fields" }));
  });
  test("returns token retrieval error using /token endpoint", async () => {
    isAuthenticatedResult = false;
    const userMock = { deleteOne: (_) => false, findOne: (_) => undefined };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => userMock);
    jest.spyOn(passport, "authenticate").mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        return callback(undefined, { name: "test", email: "mail", password: "pass" }, {});
      };
    });
    const payload = { email: "email", password: "pass" };
    const response = await testAgent.post("/auth/token").send(payload);
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(JSON.stringify({ error: "Token retrieval error" }));
  });
  test("returns correct result using /logout endpoint", async () => {
    isAuthenticatedResult = true;
    const response = await testAgent.post("/auth/logout");
    expect(response.statusCode).toBe(302);
    expect(response.text).toBe("Found. Redirecting to /auth/login");
    expect(response.headers.location).toBe("/auth/login");
  });
});

function configureTestSever(testRouter) {
  // configure mock result (needed by POST requests)
  const userMockResult = {
    deleteOne: (_) => false,
    findOne: (_) => ({ save: () => {} }),
  };
  jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => userMockResult);
  const mockResult = {
    deleteOne: (_) => false,
    find: (user) => {
      [{ email: user.email, password: "pass", save: () => {} }];
    },
  };
  jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
  jest.spyOn(bcrypt, "hashSync").mockResolvedValue("challenge-mocked");
  // create auth config object
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const authConfig = new AuthConfig(passport, components);
  // initial test server configuration
  const testApp = express();
  testApp.engine("handlebars", engine({ helpers: helpers() }));
  testApp.set("view engine", "handlebars");
  testApp.set("views", "./public");
  testApp.use(express.static("./public"));
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(flash());
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  // initialize and configure passport
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.locals.passport = authConfig.configure();
  // mock request user and authenticated logic
  testApp.use((req, res, next) => {
    req.isAuthenticated = () => isAuthenticatedResult;
    req.user = {
      hostUser: 1,
      toJSON: () => ({
        name: "Test User",
        email: "test@example.com",
        password: "supersecret",
      }),
      challenge: "testchallenge",
      save: () => {},
    };
    next();
  });
  // connect test router to auth endpoint
  testApp.use("/auth", testRouter.createRoutes());
  return testApp;
}

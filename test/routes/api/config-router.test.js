import { ConfigRouter } from "../../../src/routes/api/config-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { ScrapConfig } from "../../../src/model/scrap-config.js";
import { LogLevel } from "../../../config/app-types.js";

import supertest from "supertest";
import passport from "passport";
import express from "express";
import session from "express-session";
import { jest } from "@jest/globals";
import { Strategy } from "passport-local";

jest.mock("../../../src/model/scrap-config.js");

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/", method: "get" },
      { path: "/groups", method: "get" },
      { path: "/groups/observers", method: "get" },
      { path: "/groups/observers/components", method: "get" },
      { path: "/", method: "put" },
      { path: "/groups", method: "put" },
      { path: "/groups/observers", method: "put" },
      { path: "/", method: "post" },
      { path: "/groups", method: "post" },
      { path: "/groups/observers", method: "post" },
      { path: "/", method: "delete" },
      { path: "/groups", method: "delete" },
      { path: "/groups/observers", method: "delete" },
    ];
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const testRouter = new ConfigRouter(components);
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

describe("created config GET routes", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const mockResult = { findById: (configId) => getInitConfig(configId) };
  jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
  // configue test express app server
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/config", new ConfigRouter(components).createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);

  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.get("/configs/unknown");
    expect(response.statusCode).toBe(404);
  });
  test("returns correct result for path '/'", async () => {
    const response = await testAgent.get("/config");
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(123);
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups'", async () => {
    const response = await testAgent.get("/config/groups");
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(123).groups;
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?name=test1'", async () => {
    const response = await testAgent.get("/config/groups").query({name: "test1"});
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(123).groups.filter(g => g.name === "test1");
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?name=unknown'", async () => {
    const response = await testAgent.get("/config/groups").query({name: "unknown"});
    expect(response.statusCode).toBe(200);
    const expectedContent = [];
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?category=@@@'", async () => {
    const response = await testAgent.get("/config/groups").query({category: "@@@"});
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(123).groups.filter(g => g.category === "@@@");
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?category=unknown'", async () => {
    const response = await testAgent.get("/config/groups").query({category: "unknown"});
    expect(response.statusCode).toBe(200);
    const expectedContent = [];
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?domain=www.google.com'", async () => {
    const response = await testAgent.get("/config/groups").query({domain: "www.google.com"});
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(123).groups.filter(g => g.domain === "www.google.com");
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?domain=unknown'", async () => {
    const response = await testAgent.get("/config/groups").query({domain: "unknown"});
    expect(response.statusCode).toBe(200);
    const expectedContent = [];
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?name=test1&category=$$$", async () => {
    const response = await testAgent.get("/config/groups").query({name: "test1", category: "$$$"});
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(123).groups.filter(g => g.name === "test1" && g.category === "$$$");
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?name=test1&category=@@@", async () => {
    const response = await testAgent.get("/config/groups").query({name: "test1", category: "@@@"});
    expect(response.statusCode).toBe(200);
    const expectedContent = [];
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?name=test1&domain=www.google.com", async () => {
    const response = await testAgent.get("/config/groups").query({name: "test1", domain: "www.google.com"});
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(123).groups.filter(g => g.name === "test1" && g.domain === "www.google.com");
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?name=test1&domain=unknown.com", async () => {
    const response = await testAgent.get("/config/groups").query({name: "test1", domain: "unknown.com"});
    expect(response.statusCode).toBe(200);
    const expectedContent = [];
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?category=$$$&domain=www.google.com", async () => {
    const response = await testAgent.get("/config/groups").query({category: "$$$", domain: "www.google.com"});
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(123).groups.filter(g => g.category === "$$$" && g.domain === "www.google.com");
    expect(response.body).toStrictEqual(expectedContent);
  });
  test("returns correct result for path '/groups?category=unknown&domain=www.google.com", async () => {
    const response = await testAgent.get("/config/groups").query({category: "unknown", domain: "www.google.com"});
    expect(response.statusCode).toBe(200);
    const expectedContent = [];
    expect(response.body).toStrictEqual(expectedContent);
  });
});

function createMockAuthRouter() {
  const router = express.Router();
  const configId = 123;
  // configure mocked login logic
  const options = { usernameField: "mail", passwordField: "pass" };
  const verify = (_user, _pass, done) => done(null, { id: 1, config: configId });
  passport.use("mock-login", new Strategy(options, verify));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((userId, done) => done(null, { id: userId, config: configId }));
  // use passport mock login in tests
  router.post("/login", passport.authenticate("mock-login"));
  return router;
}

function getInitConfig(configId) {
  return {
    id: configId,
    user: 1,
    groups: [
      {
        name: "test1",
        category: "$$$",
        domain: "www.google.com",
        observers: {
          name: "logo",
          path: "info",
          price: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
        },
      },
      {
        name: "test2",
        category: "@@@",
        domain: "www.google.com",
        observers: {
          name: "text",
          path: "status",
          price: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
        },
      },
    ],
  };
}

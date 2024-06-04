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
  describe("returns correct groups using URL", () => {
    const urlBase = "/config/groups";
    it.each([
      ["/groups", undefined],
      ["/groups?name=test1", { name: "test1" }],
      ["/groups?name=unknown", { name: "unknown" }],
      ["/groups?category=@@@", { category: "@@@" }],
      ["/groups?category=unknown", { category: "unknown" }],
      ["/groups?domain=www.google.com", { domain: "www.google.com" }],
      ["/groups?domain=unknown", { domain: "unknown" }],
      ["/groups?name=test1&category=$$$", { name: "test1", category: "$$$" }],
      ["/groups?name=test1&category=@@@", { name: "test1", category: "@@@" }],
      ["/groups?name=test1&domain=www.google.com", { name: "test1", domain: "www.google.com" }],
      ["/groups?name=test1&domain=unknown.com", { name: "test1", domain: "unknown.com" }],
      ["/groups?category=$$$&domain=www.google.com", { category: "$$$", domain: "www.google.com" }],
      ["/groups?category=unknown&domain=www.google.com", { category: "unknown", domain: "www.google.com" }],
      ["/groups?name=test1&category=@@@&domain=www.google.com", { name: "test1", category: "@@@", domain: "www.google.com" }],
      ["/groups?name=test2&category=@@@&domain=www.google.com", { name: "test2", category: "@@@", domain: "www.google.com" }],
    ])("%s", async (_, filterObj) => {
      const response = await testAgent.get(urlBase).query(filterObj);
      expect(response.statusCode).toBe(200);
      const expectedContent = filterConfig(getInitConfig(123).groups, filterObj);
      expect(response.body).toStrictEqual(expectedContent);
    });
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

function filterConfig(array, filter) {
  if (filter == null) {
    return array;
  }
  let result = array;
  for (const [key, value] of Object.entries(filter)) {
    result = result.filter(element => element[key] === value)
  }
  return result;
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

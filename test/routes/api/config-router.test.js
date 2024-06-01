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
  const testApp = express();
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests" }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/config", new ConfigRouter(components).createRoutes());
  testApp.use("/auth", createMockAuthRouter());

  const userConfig = {
    user: "ID",
    groups: [
      {
        name: "test",
        domain: "www.google.com",
        observers: {
          name: "logo",
          path: "info",
          price: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
        },
      },
    ],
  };
  const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
  jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

  const authUser = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await authUser.post("/auth/login").send(mockAuth);
  });

  test("returns correct result for unknown path", async () => {
    const response = await authUser.get("/configs/unknown");
    expect(response.statusCode).toBe(404);
  });
  test("returns correct result for path '/'", async () => {
    const response = await authUser.get("/config");
    expect(response.statusCode).toBe(200);
  });
});

function createMockAuthRouter() {
  const router = express.Router();
  // configure mocked login logic
  const options = { usernameField: "mail", passwordField: "pass" };
  const verify = (_user, _pass, done) => done(null, { id: 1, config: {} });
  passport.use("mock-login", new Strategy(options, verify));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((userId, done) => done(null, { id: userId, config: {} }));
  // use passport mock login in tests
  router.post("/login", passport.authenticate("mock-login"));
  return router;
}

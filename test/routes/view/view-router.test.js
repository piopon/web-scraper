import { ViewRouter } from "../../../src/routes/view/view-router.js";
import { ScrapConfig } from "../../../src/model/scrap-config.js";

import supertest from "supertest";
import passport from "passport";
import express from "express";
import session from "express-session";
import helpers from "handlebars-helpers";
import { jest } from "@jest/globals";
import { engine } from "express-handlebars";
import { Strategy } from "passport-local";

jest.mock("../../../src/model/scrap-config.js");

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/", method: "get" },
      { path: "/status", method: "get" },
    ];
    const testRouter = new ViewRouter();
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
  const mockResult = { findById: (configId) => getInitConfig(true, configId, "uname") };
  jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
  // configue test express app server
  const testApp = express();
  testApp.engine("handlebars", engine({ helpers: helpers() }));
  testApp.set("view engine", "handlebars");
  testApp.set("views", "./public");
  testApp.use(express.static("./public"));
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/view", new ViewRouter().createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.get("/view/unknown");
    expect(response.statusCode).toBe(404);
  });
  test("returns correct result using /view endpoint", async () => {
    const response = await testAgent.get("/view");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("text/html");
    expect(response.text).toEqual(expect.not.arrayContaining(["", null, undefined]));
  });
  test("returns correct result using /view/status endpoint", async () => {
    const response = await testAgent.get("/view/status");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("text/html");
    expect(response.text).toEqual(expect.not.arrayContaining(["", null, undefined]));
    expect(response.text).toContain("<section class=\"status-dashboard\">");
    expect(response.text).toContain("<div class=\"status-settings\">");
    expect(response.text).toContain("<label class=\"filter-label\">component:</label>");
    expect(response.text).toContain("<label class=\"filter-label\">type:</label>");
    expect(response.text).toContain("<label class=\"date-label\">from:</label>");
    expect(response.text).toContain("<label class=\"date-label\">to:</label>");
    expect(response.text).toContain("<label class=\"btn-label\">refresh:</label>");
  });
});

function createMockAuthRouter() {
  const router = express.Router();
  const configId = 123;
  const userName = "test-name";
  // configure mocked login logic
  const options = { usernameField: "mail", passwordField: "pass" };
  const verify = (_user, _pass, done) => done(null, { id: 1, config: configId, name: userName });
  passport.use("mock-login", new Strategy(options, verify));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((userId, done) => done(null, { id: userId, config: configId, name: userName }));
  // use passport mock login in tests
  router.post("/login", passport.authenticate("mock-login"));
  return router;
}

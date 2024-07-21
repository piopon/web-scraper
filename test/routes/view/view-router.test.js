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
    expect(response.text).toContain("<h3>scraper configuration</h3>");
    expect(response.text).toContain("<h5>user: test-name</h5>");
    expect(response.text).toContain('<h2 class="group-title">test1</h2>');
    expect(response.text).toContain('<h2 class="group-title">test2</h2>');
    expect(response.text).toContain('<input type="text" class="group-name" name="name" value="test1" disabled/>');
    expect(response.text).toContain('<input type="text" class="group-domain" name="domain" value="test.com" />');
    expect(response.text).toContain('<input type="button" class="group-category" name="category" value="$$$" />');
    expect(response.text).toContain('<input type="text" class="observer-name" name="name" value="logo" disabled/>');
    expect(response.text).toContain('<input type="text" class="observer-path" name="path" value="info" />');
    expect(response.text).toContain(
      '<input type="text" class="component-price-selector" name="selector" value="body p b" />'
    );
    expect(response.text).toContain('<input type="text" class="group-name" name="name" value="test2" disabled/>');
    expect(response.text).toContain('<input type="button" class="group-category" name="category" value="@@@" />');
  });
  test("returns correct result using /view/status endpoint", async () => {
    const response = await testAgent.get("/view/status");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("text/html");
    expect(response.text).toEqual(expect.not.arrayContaining(["", null, undefined]));
    expect(response.text).toContain('<section class="status-dashboard">');
    expect(response.text).toContain('<div class="status-settings">');
    expect(response.text).toContain('<label class="filter-label">component:</label>');
    expect(response.text).toContain('<label class="filter-label">type:</label>');
    expect(response.text).toContain('<label class="date-label">from:</label>');
    expect(response.text).toContain('<label class="date-label">to:</label>');
    expect(response.text).toContain('<label class="btn-label">refresh:</label>');
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

function createGroup(db, name, category, domain, ...observers) {
  return {
    name: name,
    category: category,
    domain: domain,
    observers: observers,
    ...(db && { getIdentifier: () => `name = ${name}` }),
    ...(db && { copyValues: (_) => true }),
  };
}

function createObserver(db, name, path, target, history, ...components) {
  return {
    name: name,
    path: path,
    target: target,
    history: history,
    ...(components[0] && { price: components[0] }),
    ...(components[1] && { title: components[1] }),
    ...(components[2] && { image: components[2] }),
    ...(db && { getIdentifier: () => `name = ${name}` }),
    ...(db && { copyValues: (_) => true }),
  };
}

function createComponent(interval, selector, attribute, auxiliary) {
  return { interval: interval, selector: selector, attribute: attribute, auxiliary: auxiliary };
}

function getInitConfig(db, configId, name) {
  const component1 = createComponent("5m", "body p b", "innerHTML", "PLN");
  const component2 = createComponent("1h", "body p b", "innerHTML", "USD");
  const observer1 = createObserver(db, "logo", "info", "load", "off", component1);
  const observer2 = createObserver(db, "text", "status", "domcontentloaded", "onChange", component2);
  return {
    id: configId,
    user: name,
    groups: [
      createGroup(db, "test1", "$$$", "test.com", observer1),
      createGroup(db, "test2", "@@@", "test.com", observer2),
    ],
    ...(db && { getIdentifier: () => `name = ${name}` }),
    ...(db && { copyValues: (_) => true }),
    ...(db && { save: () => true }),
    ...(db && {
      toJSON: () => ({
        id: configId,
        user: name,
        groups: [
          createGroup(false, "test1", "$$$", "test.com", observer1),
          createGroup(false, "test2", "@@@", "test.com", observer2),
        ],
      }),
    }),
  };
}

import { SettingsRouter } from "../../../src/routes/api/settings-router.js";
import { ScrapConfig } from "../../../src/model/scrap-config.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../src/config/app-types.js";

import supertest from "supertest";
import passport from "passport";
import express from "express";
import session from "express-session";
import { jest } from "@jest/globals";
import { Strategy } from "passport-local";

jest.mock("../../../src/model/scrap-config.js");

const configId = 123;

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/import", method: "post" },
      { path: "/features", method: "get" },
    ];
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const testRouter = new SettingsRouter(components);
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

describe("created settings POST routes", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const localPassport = new passport.Passport();
  // configue test express app server
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(localPassport.initialize());
  testApp.use(localPassport.session());
  testApp.use("/settings", new SettingsRouter(components).createRoutes());
  testApp.use("/auth", createMockAuthRouter(localPassport));
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.post("/status/unknown");
    expect(response.statusCode).toBe(404);
  });
  describe("returns correct result using /settings endpoint when", () => {
    it.each([
      [
        "query is NOT empty",
        { query: { property: "value" }, body: {} },
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "additionalProperties",
              message: "must NOT have additional properties",
              params: { additionalProperty: "property" },
              schemaPath: "#/additionalProperties",
            },
          ],
        },
      ],
      [
        "body is empty",
        { query: {}, body: {} },
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'user'",
              params: { missingProperty: "user" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "body has invalid structure",
        { query: {}, body: { invalid: "struct" } },
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'user'",
              params: { missingProperty: "user" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "body has invalid values",
        { query: {}, body: createConfig(false) },
        {
          status: 400,
          response: "Group name must have at least one letter",
        },
      ],
      [
        "database throws an error",
        { query: {}, body: createConfig(true) },
        {
          error: { server: "Mockup server error" },
          status: 500,
          response: "Mockup server error",
        },
      ],
      [
        "import config logic throws an error",
        { query: {}, body: createConfig(true) },
        {
          error: { client: "Mockup client error" },
          status: 400,
          response: "Mockup client error",
        },
      ],
      [
        "body has valid values",
        { query: {}, body: createConfig(true) },
        {
          error: { server: "", client: "" },
          status: 200,
          response: "Imported configuration for user test",
        },
      ],
    ])("%s", async (_, input, expected) => {
      const mockResult = {
        findById: (_) =>
          returnObjOrThrow(expected.error.server, {
            user: "",
            groups: [],
            save: () => returnObjOrThrow(expected.error.client, {}),
          }),
      };
      jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
      const response = await testAgent.post("/settings/import").query(input.query).send(input.body);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
});

function createMockAuthRouter(passport) {
  const router = express.Router();
  const strategyName = `mock-login-${configId}`;
  // configure mocked login logic
  const options = { usernameField: "mail", passwordField: "pass" };
  const verify = (_user, _pass, done) => done(null, { id: 1, config: configId, save: (_) => true });
  passport.use(strategyName, new Strategy(options, verify));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((userId, done) =>
    done(null, { id: userId, name: "test", config: configId, save: (_) => true })
  );
  // use passport mock login in tests
  router.post("/login", passport.authenticate(strategyName));
  return router;
}

function returnObjOrThrow(errorMessage, obj) {
  if (errorMessage) {
    throw Error(errorMessage);
  }
  return obj;
}

function createConfig(valid) {
  const component1 = createComponent("5m", "body p b", "innerHTML", "PLN");
  const component2 = createComponent("1h", "body p b", "innerHTML", "USD");
  const observer1 = createObserver("logo", "info", "load", "off", component1);
  const observer2 = createObserver("text", "status", "domcontentloaded", "onChange", component2);
  return {
    user: "test",
    groups: [
      createGroup(valid ? "test1" : "1", "$$$", "test.com", observer1),
      createGroup(valid ? "test2" : "2", "@@@", "test.com", observer2),
    ],
  };
}

function createGroup(name, category, domain, ...observers) {
  return {
    name: name,
    category: category,
    domain: domain,
    observers: observers,
  };
}

function createObserver(name, path, target, history, ...components) {
  return {
    name: name,
    path: path,
    target: target,
    history: history,
    ...(components[0] && { data: components[0] }),
    ...(components[1] && { title: components[1] }),
    ...(components[2] && { image: components[2] }),
  };
}

function createComponent(interval, selector, attribute, auxiliary) {
  return { interval: interval, selector: selector, attribute: attribute, auxiliary: auxiliary };
}

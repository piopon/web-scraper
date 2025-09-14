import { SettingsRouter } from "../../../src/routes/api/settings-router.js";
import { ScrapConfig } from "../../../src/model/scrap-config.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../src/config/app-types.js";

import supertest from "supertest";
import express from "express";
import session from "express-session";
import { jest } from "@jest/globals";

jest.mock("../../../src/model/scrap-config.js");

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [{ path: "/import", method: "post" }];
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
  // configue test express app server
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use("/settings", new SettingsRouter(components).createRoutes());
  // create test client to call server requests
  const testClient = supertest(testApp);
  test("returns correct result for unknown path", async () => {
    const response = await testClient.post("/status/unknown");
    expect(response.statusCode).toBe(404);
  });
  describe("returns correct result using /settings endpoint when", () => {
    it.each([
      [
        "query is NOT empty",
        { query: {property: "value"}, body: {} },
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
        { query: {}, body: {invalid: "struct"} },
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
    ])("%s", async (_, input, expected) => {
      const mockResult = { findById: (_) => ({ user: "", groups: [], save: () => {} }) };
      jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
      const response = await testClient.post("/settings/import").query(input.query).send(input.body);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
});

function createConfig(db, configId, name) {
  const component1 = createComponent("5m", "body p b", "innerHTML", "PLN");
  const component2 = createComponent("1h", "body p b", "innerHTML", "USD");
  const observer1 = createObserver(db, "logo", "info", "load", "off", component1);
  const observer2 = createObserver(db, "text", "status", "domcontentloaded", "onChange", component2);
  return {
    user: name,
    groups: [
      createGroup(db, "test1", "$$$", "test.com", observer1),
      createGroup(db, "test2", "@@@", "test.com", observer2),
    ],
    ...(db && { getIdentifier: () => `name = ${name}` }),
    ...(db && { copyValues: (_) => true }),
    ...(db && { save: () => true }),
    ...(db && { _id: configId, }),
  };
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
    ...(components[0] && { data: components[0] }),
    ...(components[1] && { title: components[1] }),
    ...(components[2] && { image: components[2] }),
    ...(db && { getIdentifier: () => `name = ${name}` }),
    ...(db && { copyValues: (_) => true }),
  };
}

function createComponent(interval, selector, attribute, auxiliary) {
  return { interval: interval, selector: selector, attribute: attribute, auxiliary: auxiliary };
}
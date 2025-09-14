import { SettingsRouter } from "../../../src/routes/api/settings-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../src/config/app-types.js";

import supertest from "supertest";
import express from "express";
import session from "express-session";

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
      const response = await testClient.post("/settings/import").query(input.query).send(input.body);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
});

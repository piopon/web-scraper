import { StatusRouter } from "../../../src/routes/api/status-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel, ComponentType, ComponentStatus } from "../../../config/app-types.js";
import { ParamsParser } from "../../../src/middleware/params-parser.js";

import supertest from "supertest";
import express from "express";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [{ path: "/", method: "get" }];
    const serverHistory = {};
    const serverStatus = { getName: () => "Running", getHistory: () => serverHistory };
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const testRouter = new StatusRouter(serverStatus, components);
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

describe("created status GET routes", () => {
  const serverHistory = { entry1: "history123" };
  const serverStatus = { getName: () => "test-server", getHistory: () => serverHistory };
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  components.addComponent(createInnerComponent("foo"));
  // configue test express app server
  const testApp = express();
  testApp.use(ParamsParser.middleware);
  testApp.use("/status", new StatusRouter(serverStatus, components).createRoutes());
  // create test client to call server requests
  const testClient = supertest(testApp);
  test("returns correct result for unknown path", async () => {
    const response = await testClient.get("/status/unknown");
    expect(response.statusCode).toBe(404);
  });
  describe("returns correct result using /status endpoint when", () => {
    it.each([
      [
        "query has invalid structure",
        { unknown: "status" },
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "additionalProperties",
              message: "must NOT have additional properties",
              params: { additionalProperty: "unknown" },
              schemaPath: "#/additionalProperties",
            },
          ],
        },
      ],
      [
        "query is empty",
        {},
        {
          status: 200,
          response: [
            { name: "web-components", status: "running" },
            { name: "test-server", status: "running" },
          ],
        },
      ],
      [
        "query contains server name",
        { name: "test-server" },
        {
          status: 200,
          response: [{ name: "test-server", status: "running" }],
        },
      ],
      [
        "query contains any existing component name",
        { name: "web-components" },
        {
          status: 200,
          response: [{ name: "web-components", status: "running" }],
        },
      ],
      [
        "query contains non-existing component name",
        { name: "unknown" },
        {
          status: 200,
          response: [],
        },
      ],
      [
        "query wants a full history",
        { name: "test-server", history: true },
        {
          status: 200,
          response: [{ name: "test-server", status: "running", history: serverHistory }],
        },
      ],
    ])("%s", async (_, inputQuery, expected) => {
      const response = await testClient.get("/status").query(inputQuery);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
});

function createInnerComponent(name) {
  return {
    getName: () => name,
    getStatus: () => ComponentStatus.RUNNING,
    getHistory: () => [{ entryComponent: "historyComponent" }],
    getInfo: () => ({ types: [ComponentType.CONFIG], initWait: true }),
    update: () => {},
  };
}

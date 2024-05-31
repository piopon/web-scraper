import { ConfigRouter } from "../../../src/routes/api/config-router.js";
import { LogLevel } from "../../../config/app-types.js";
import { WebComponents } from "../../../src/components/web-components.js";

import supertest from "supertest";
import express from "express";

describe("createRoutes() method", () => {
  test("returns correct routes", async () => {
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
  const testRouter = new ConfigRouter(components);
  testApp.use("/config", testRouter.createRoutes());
  test("returns correct result for unknown path", async () => {
    const response = await supertest(testApp).get("/configs/unknown");
    expect(response.statusCode).toBe(404);
  });
});

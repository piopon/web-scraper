import { ConfigRouter } from "../../../src/routes/api/config-router.js"
import { LogLevel } from "../../../config/app-types.js";
import { WebComponents } from "../../../src/components/web-components.js";

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
    createdRoutes.stack.map(s => s.route).forEach(route => {
        expect(expectedRoutes.filter(
        (expected) => expected.path === route.path && Object.keys(route.methods).includes(expected.method)
      ).length).toBe(1);
    });
  });
});

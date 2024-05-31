import { ConfigRouter } from "../../../src/routes/api/config-router.js"
import { LogLevel } from "../../../config/app-types.js";
import { WebComponents } from "../../../src/components/web-components.js";

describe("createRoutes() method", () => {
  test("returns correct routes", async () => {
    const expectedRoutes = [
      { path: "/", method: "get" },
      { path: "/groups", method: "get" },
      { path: "/groups/observers", method: "get" },
    ];
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const testRouter = new ConfigRouter(components);
    const createdRoutes = testRouter.createRoutes();
    expectedRoutes.forEach(route => {
        expect(createdRoutes.stack.some((s) => Object.keys(s.route.methods).includes(route.method))).toBe(true);
        expect(createdRoutes.stack.some((s) => s.route.path === route.path)).toBe(true)
    })
  });
});

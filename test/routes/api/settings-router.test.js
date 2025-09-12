import { SettingsRouter } from "../../../src/routes/api/settings-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../src/config/app-types.js";

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


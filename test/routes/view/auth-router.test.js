import { AuthRouter } from "../../../src/routes/view/auth-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../config/app-types.js";

import passport from "passport";

describe("createRoutes() method", () => {
    test("returns correct number of routes", () => {
      const expectedRoutes = [
        { path: "/register", method: "get" },
        { path: "/login", method: "get" },
        { path: "/register", method: "post" },
        { path: "/login", method: "post" },
        { path: "/logout", method: "post" },
      ];
      const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
      const testRouter = new AuthRouter(components, passport);
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
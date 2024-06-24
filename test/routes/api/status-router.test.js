import { StatusRouter } from "../../../src/routes/api/status-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../config/app-types.js";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/", method: "get" },
    ];
    const serverStatus = { getName: () => "Running", getHistory: () => {} };
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const testRouter = new StatusRouter(serverStatus, components);
    const createdRoutes = testRouter.createRoutes();
    expect(createdRoutes.stack.length).toBe(expectedRoutes.length);
  });
});

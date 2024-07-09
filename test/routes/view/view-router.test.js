import { ViewRouter } from "../../../src/routes/view/view-router.js";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [{ path: "/", method: "get" }, { path: "/status", method: "get" }];
    const testRouter = new ViewRouter();
    const createdRoutes = testRouter.createRoutes();
    expect(createdRoutes.stack.length).toBe(expectedRoutes.length);
  });
});

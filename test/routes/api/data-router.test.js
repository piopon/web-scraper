import { DataRouter } from "../../../src/routes/api/data-router.js";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [{ path: "/", method: "get" }];
    const testRouter = new DataRouter("");
    const createdRoutes = testRouter.createRoutes();
    expect(createdRoutes.stack.length).toBe(expectedRoutes.length);
  });
});

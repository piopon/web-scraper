import { DataRouter } from "../../../src/routes/api/data-router.js";

import fs from "fs";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [{ path: "/", method: "get" }];
    const testRouter = new DataRouter("");
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

function createDataFile(filePath) {
  try {
    const dataContent = [];
    fs.writeFileSync(filePath, JSON.stringify(dataContent));
  } catch (err) {
    console.error(`Could not create data file: ${err}`);
  }
}

function removeDataFile(filePath) {
  fs.rmSync(filePath, { force: true });
}

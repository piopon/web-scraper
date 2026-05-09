import { DocsRouter } from "../../../src/routes/api/docs-router.js";

import express from "express";
import supertest from "supertest";

describe("created docs routes", () => {
  const testApp = express();
  testApp.use("/docs", new DocsRouter().createRoutes());
  const testClient = supertest(testApp);

  test("returns OpenAPI JSON for /docs/openapi.json endpoint", async () => {
    const response = await testClient.get("/docs/openapi.json");

    expect(response.statusCode).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.info.title).toBe("web-scraper API");
    expect(response.body.paths["/api/v1/docs/openapi.json"]).toBeDefined();
  });

  test("returns Swagger UI page for /docs endpoint", async () => {
    const response = await testClient.get("/docs/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("swagger-ui");
    expect(response.text).toContain("web-scraper API docs");
  });
});

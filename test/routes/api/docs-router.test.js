import { DocsRouter } from "../../../src/routes/api/docs-router.js";
import { VersionUtils } from "../../../src/utils/version-utils.js";

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
    expect(response.body.info.version).toBe(VersionUtils.getRuntimeVersion());
    expect(response.body.paths["/api/v1/docs/openapi.json"]).toBeDefined();
    expect(response.body.paths["/api/v1/config/groups"].post.requestBody).toBeDefined();
    expect(response.body.paths["/api/v1/config/groups"].put.requestBody).toBeDefined();
    expect(response.body.paths["/api/v1/config/groups/observers"].post.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "parent", in: "query", required: true }),
      ])
    );
    expect(response.body.paths["/api/v1/config/groups/observers"].put.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "name", in: "query", required: true }),
      ])
    );
    expect(response.body.paths["/api/v1/config/groups/observers/components"].get.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "source", in: "query", required: true }),
        expect.objectContaining({ name: "interval", in: "query" }),
        expect.objectContaining({ name: "selector", in: "query" }),
        expect.objectContaining({ name: "attribute", in: "query" }),
        expect.objectContaining({ name: "auxiliary", in: "query" }),
      ])
    );
    expect(response.body.paths["/api/v1/settings/import"].post.requestBody).toBeDefined();
  });

  test("returns Swagger UI page for /docs endpoint", async () => {
    const response = await testClient.get("/docs/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("swagger-ui");
    expect(response.text).toContain("web-scraper API docs");
  });
});

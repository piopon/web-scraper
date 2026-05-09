import express from "express";
import swaggerUi from "swagger-ui-express";

export class DocsRouter {
  /**
   * Method used to create routes for API documentation endpoints
   * @returns router object for handling documentation requests
   */
  createRoutes() {
    const router = express.Router();
    router.get("/openapi.json", (request, response) => {
      response.status(200).json(this.#createOpenApiSpec());
    });
    return router;
  }

  /**
   * Method used to create the OpenAPI specification object
   * @returns OpenAPI JSON specification
   */
  #createOpenApiSpec() {
    return {
      openapi: "3.0.3",
      info: {
        title: "web-scraper API",
        version: "1.0.0",
        description: "OpenAPI documentation for web-scraper service endpoints",
      },
      tags: [
        { name: "status", description: "Service and components status endpoints" },
        { name: "data", description: "Scraped data endpoints" },
        { name: "config", description: "Scraper configuration endpoints" },
        { name: "settings", description: "Application settings endpoints" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      paths: {
        "/api/v1/docs/openapi.json": {},
        "/api/v1/status": {},
        "/api/v1/data": {},
        "/api/v1/data/items": {},
        "/api/v1/config": {},
        "/api/v1/config/groups": {},
        "/api/v1/config/groups/observers": {},
        "/api/v1/config/groups/observers/components": {},
        "/api/v1/settings/features": {},
        "/api/v1/settings/import": {},
      },
    };
  }
}

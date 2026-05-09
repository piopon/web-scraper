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
        "/api/v1/docs/openapi.json": {
          get: {
            tags: ["status"],
            summary: "Get OpenAPI definition",
            responses: {
              200: {
                description: "OpenAPI JSON specification",
              },
            },
          },
        },
        "/api/v1/status": {
          get: {
            tags: ["status"],
            summary: "Get service and components status",
            parameters: [
              {
                name: "name",
                in: "query",
                required: false,
                schema: { type: "string" },
                description: "Optional component name filter",
              },
              {
                name: "history",
                in: "query",
                required: false,
                schema: { type: "boolean" },
                description: "Include status history when true",
              },
            ],
            responses: {
              200: {
                description: "Status list",
              },
            },
          },
        },
        "/api/v1/data": {
          get: {
            tags: ["data"],
            summary: "Get scraped data",
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: "name",
                in: "query",
                required: false,
                schema: { type: "string" },
              },
              {
                name: "category",
                in: "query",
                required: false,
                schema: { type: "string" },
              },
            ],
            responses: {
              200: {
                description: "Filtered scraped data",
              },
            },
          },
        },
        "/api/v1/data/items": {
          get: {
            tags: ["data"],
            summary: "Get flattened scraped items",
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: "name",
                in: "query",
                required: false,
                schema: { type: "string" },
              },
            ],
            responses: {
              200: {
                description: "Filtered scraped items",
              },
            },
          },
        },
        "/api/v1/config": {
          get: {
            tags: ["config"],
            summary: "Get full user scraping configuration",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Current configuration" } },
          },
        },
        "/api/v1/config/groups": {
          get: {
            tags: ["config"],
            summary: "Get groups from configuration",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Configuration groups" } },
          },
          post: {
            tags: ["config"],
            summary: "Add new group",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Group added" } },
          },
          put: {
            tags: ["config"],
            summary: "Edit group",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Group updated" } },
          },
          delete: {
            tags: ["config"],
            summary: "Delete group",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Group deleted" } },
          },
        },
        "/api/v1/config/groups/observers": {
          get: {
            tags: ["config"],
            summary: "Get observers from configuration",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Observers list" } },
          },
          post: {
            tags: ["config"],
            summary: "Add new observer",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Observer added" } },
          },
          put: {
            tags: ["config"],
            summary: "Edit observer",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Observer updated" } },
          },
          delete: {
            tags: ["config"],
            summary: "Delete observer",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Observer deleted" } },
          },
        },
        "/api/v1/config/groups/observers/components": {
          get: {
            tags: ["config"],
            summary: "Get observers source or target components",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Observer components" } },
          },
        },
        "/api/v1/settings/features": {
          get: {
            tags: ["settings"],
            summary: "Get feature toggles",
            responses: { 200: { description: "Feature flags" } },
          },
        },
        "/api/v1/settings/import": {
          post: {
            tags: ["settings"],
            summary: "Import settings configuration",
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: "Configuration imported" } },
          },
        },
      },
    };
  }
}

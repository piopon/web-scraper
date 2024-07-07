import { DataRouter } from "../../../src/routes/api/data-router.js";

import supertest from "supertest";
import express from "express";
import fs from "fs";

const testDataPath = "./data-router-test.json";

beforeAll(() => {
  createDataFile(testDataPath);
});

afterAll(() => {
  removeDataFile(testDataPath);
});

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [{ path: "/", method: "get" }];
    const testRouter = new DataRouter(testDataPath);
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

describe("created config GET routes", () => {
  // create mockup data file
  const testDataPath = "./data-router-test.json";
  createDataFile(testDataPath);
  // configue test express app server
  const testApp = express();
  testApp.use("/data", new DataRouter(testDataPath).createRoutes());
  // create test client to call server requests
  const testClient = supertest(testApp);
  test("returns correct result for unknown path", async () => {
    const response = await testClient.get("/data/unknown");
    expect(response.statusCode).toBe(404);
  });
  describe("returns correct result using /data endpoint when", () => {
    it.each([
      [
        "query has invalid structure",
        { unknown: "status" },
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "additionalProperties",
              message: "must NOT have additional properties",
              params: { additionalProperty: "unknown" },
              schemaPath: "#/additionalProperties",
            },
          ],
        },
      ],
      [
        "query is empty",
        {},
        {
          status: 200,
          response: [
            {
              name: "clothes",
              category: "👕",
              items: [
                {
                  status: "OK",
                  name: "t-shirt Regular Fit",
                  icon: "",
                  price: "29.99",
                  currency: "PLN",
                },
              ],
            },
            {
              name: "games",
              category: "🎮",
              items: [
                {
                  status: "OK",
                  name: "Diablo IV",
                  icon: "",
                  price: "349.99",
                  currency: "PLN",
                },
              ],
            },
          ],
        },
      ],
      [
        "query contains existing name",
        { name: "clothes" },
        {
          status: 200,
          response: [
            {
              name: "clothes",
              category: "👕",
              items: [
                {
                  status: "OK",
                  name: "t-shirt Regular Fit",
                  icon: "",
                  price: "29.99",
                  currency: "PLN",
                },
              ],
            },
          ],
        },
      ],
      [
        "query contains mot existing name",
        { name: "unknown" },
        {
          status: 200,
          response: [],
        },
      ],
      [
        "query contains existing category",
        { category: "🎮" },
        {
          status: 200,
          response: [
            {
              name: "games",
              category: "🎮",
              items: [
                {
                  status: "OK",
                  name: "Diablo IV",
                  icon: "",
                  price: "349.99",
                  currency: "PLN",
                },
              ],
            },
          ],
        },
      ],
      [
        "query contains mot existing name",
        { category: "unknown" },
        {
          status: 200,
          response: [],
        },
      ],
    ])("%s", async (_, inputQuery, expected) => {
      const response = await testClient.get("/data").query(inputQuery);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
  // delete mockup data file
  removeDataFile(testDataPath);
});

function createDataFile(filePath) {
  try {
    const dataContent = [
      {
        name: "clothes",
        category: "👕",
        items: [
          {
            status: "OK",
            name: "t-shirt Regular Fit",
            icon: "",
            price: "29.99",
            currency: "PLN",
          },
        ],
      },
      {
        name: "games",
        category: "🎮",
        items: [
          {
            status: "OK",
            name: "Diablo IV",
            icon: "",
            price: "349.99",
            currency: "PLN",
          },
        ],
      },
    ];
    fs.writeFileSync(filePath, JSON.stringify(dataContent));
  } catch (err) {
    console.error(`Could not create data file: ${err}`);
  }
}

function removeDataFile(filePath) {
  fs.rmSync(filePath, { force: true });
}

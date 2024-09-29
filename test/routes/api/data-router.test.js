import { DataRouter } from "../../../src/routes/api/data-router.js";

import supertest from "supertest";
import express from "express";
import path from "path";
import fs from "fs";

const testDataPath = "./owner/data.json";

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

describe("created data GET routes", () => {
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
              keyword: "required",
              message: "must have required property 'owner'",
              params: { missingProperty: "owner" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "query is empty",
        {},
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'owner'",
              params: { missingProperty: "owner" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "query contains existing name",
        { owner: "owner", name: "clothes" },
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
        "query contains not existing name",
        { owner: "owner", name: "unknown" },
        {
          status: 200,
          response: [],
        },
      ],
      [
        "query contains existing category",
        { owner: "owner", category: "🎮" },
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
        "query contains not existing category",
        { owner: "owner", category: "unknown" },
        {
          status: 200,
          response: [],
        },
      ],
      [
        "query contains existing and matching name and category",
        { owner: "owner", name: "games", category: "🎮" },
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
        "query contains existing but not matching name and category",
        { owner: "owner", name: "games", category: "👕" },
        {
          status: 200,
          response: [],
        },
      ],
      [
        "query contains existing name and not existing category",
        { owner: "owner", name: "games", category: "unknown" },
        {
          status: 200,
          response: [],
        },
      ],
      [
        "query contains not existing name and existing category",
        { owner: "owner", name: "unknown", category: "👕" },
        {
          status: 200,
          response: [],
        },
      ],
      [
        "query contains not existing name and category",
        { owner: "owner", name: "unknown", category: "unknown" },
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
    // create parent directory (if needed)
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    // create the test data file
    fs.writeFileSync(filePath, JSON.stringify(dataContent));
  } catch (err) {
    console.error(`Could not create data file: ${err}`);
  }
}

function removeDataFile(filePath) {
  // remove the test data file
  fs.rmSync(filePath, { force: true });
  // remove parent directory (if present)
  const fileDir = path.dirname(filePath);
  if (fileDir !== ".") {
    fs.rmdirSync(fileDir);
  }
}

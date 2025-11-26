import { DataRouter } from "../../../src/routes/api/data-router.js";

import supertest from "supertest";
import passport from "passport";
import express from "express";
import session from "express-session";
import jsonwebtoken from "jsonwebtoken";
import path from "path";
import fs from "fs";

import { jest } from "@jest/globals";
import { Strategy } from "passport-local";

const testOwner = "data_route@test.com";
const testDataPath = `./${testOwner}/data.json`;

jest.mock("jsonwebtoken");

beforeAll(() => {
  createDataFile(testDataPath);
});

afterAll(() => {
  removeDataFile(testDataPath);
});

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/", method: "get" },
      { path: "/items", method: "get" },
    ];
    const testConfig = { path: path.parse(testDataPath).root, file: "data.json" };
    const testRouter = new DataRouter(testConfig);
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
  const testConfig = { path: path.parse(testDataPath).root, file: "data.json" };
  // configue test express app server
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/data", new DataRouter(testConfig).createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: testOwner, pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.get("/data/unknown");
    expect(response.statusCode).toBe(404);
  });
  describe("returns correct result using", () => {
    describe("/data endpoint when", () => {
      it.each([
        [
          "query has invalid structure",
          testOwner,
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
          "query is empty for invalid user",
          "jwt-mock@owner.com",
          {},
          {
            status: 400,
            response: "Invalid data owner provided",
          },
        ],
        [
          "query is empty for valid user",
          testOwner,
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
                    data: "29.99",
                    extra: "PLN",
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
                    data: "349.99",
                    extra: "PLN",
                  },
                ],
              },
            ],
          },
        ],
        [
          "query contains existing name for valid user",
          testOwner,
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
                    data: "29.99",
                    extra: "PLN",
                  },
                ],
              },
            ],
          },
        ],
        [
          "query contains not existing name for valid user",
          testOwner,
          { name: "unknown" },
          {
            status: 200,
            response: [],
          },
        ],
        [
          "query contains existing category for valid user",
          testOwner,
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
                    data: "349.99",
                    extra: "PLN",
                  },
                ],
              },
            ],
          },
        ],
        [
          "query contains not existing category for valid user",
          testOwner,
          { category: "unknown" },
          {
            status: 200,
            response: [],
          },
        ],
        [
          "query contains existing and matching name and category for valid user",
          testOwner,
          { name: "games", category: "🎮" },
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
                    data: "349.99",
                    extra: "PLN",
                  },
                ],
              },
            ],
          },
        ],
        [
          "query contains existing but not matching name and category for valid user",
          testOwner,
          { name: "games", category: "👕" },
          {
            status: 200,
            response: [],
          },
        ],
        [
          "query contains existing name and not existing category",
          testOwner,
          { name: "games", category: "unknown" },
          {
            status: 200,
            response: [],
          },
        ],
        [
          "query contains not existing name and existing category",
          testOwner,
          { name: "unknown", category: "👕" },
          {
            status: 200,
            response: [],
          },
        ],
        [
          "query contains not existing name and category",
          testOwner,
          { name: "unknown", category: "unknown" },
          {
            status: 200,
            response: [],
          },
        ],
      ])("%s", async (_, mockOwner, inputQuery, expected) => {
        // prepare JWT authentication mock
        testAgent.set({ Authorization: `Token JWT-MOCKED-TOKEN` });
        jest.spyOn(jsonwebtoken, "verify").mockReturnValue({ email: mockOwner });
        // send request and check response
        const response = await testAgent.get("/data").query(inputQuery);
        expect(response.statusCode).toBe(expected.status);
        expect(response.body).toStrictEqual(expected.response);
      });
    });
    describe("/data/items endpoint when", () => {
      it.each([
        [
          "query has invalid structure",
          testOwner,
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
          "query is empty for invalid user",
          "jwt-mock@owner.com",
          {},
          {
            status: 400,
            response: "Invalid data owner provided",
          },
        ],
        [
          "query is empty for valid user",
          testOwner,
          {},
          {
            status: 200,
            response: [
              {
                status: "OK",
                name: "t-shirt Regular Fit",
                icon: "",
                data: "29.99",
                extra: "PLN",
              },
              {
                status: "OK",
                name: "Diablo IV",
                icon: "",
                data: "349.99",
                extra: "PLN",
              },
            ],
          },
        ],
        [
          "query contains existing name for valid user",
          testOwner,
          { name: "Diablo IV" },
          {
            status: 200,
            response: [
              {
                status: "OK",
                name: "Diablo IV",
                icon: "",
                data: "349.99",
                extra: "PLN",
              },
            ],
          },
        ],
        [
          "query contains existing id for valid user",
          testOwner,
          { name: "diablo-iv" },
          {
            status: 200,
            response: [
              {
                status: "OK",
                name: "Diablo IV",
                icon: "",
                data: "349.99",
                extra: "PLN",
              },
            ],
          },
        ],
        [
          "query contains not existing name for valid user",
          testOwner,
          { name: "unknown" },
          {
            status: 200,
            response: [],
          },
        ],
      ])("%s", async (_, mockOwner, inputQuery, expected) => {
        // prepare JWT authentication mock
        testAgent.set({ Authorization: `Token JWT-MOCKED-TOKEN` });
        jest.spyOn(jsonwebtoken, "verify").mockReturnValue({ email: mockOwner });
        // send request and check response
        const response = await testAgent.get("/data/items").query(inputQuery);
        expect(response.statusCode).toBe(expected.status);
        expect(response.body).toStrictEqual(expected.response);
      });
    });
  });
});

function createMockAuthRouter() {
  const router = express.Router();
  const configId = 123;
  // configure mocked login logic
  const options = { usernameField: "mail", passwordField: "pass" };
  const verify = (_user, _pass, done) => done(null, { id: 1, config: configId });
  passport.use("mock-login", new Strategy(options, verify));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((userId, done) => done(null, { id: userId, config: configId }));
  // use passport mock login in tests
  router.post("/login", passport.authenticate("mock-login"));
  return router;
}

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
            data: "29.99",
            extra: "PLN",
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
            data: "349.99",
            extra: "PLN",
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
    fs.rmSync(fileDir, {maxRetries: 10, retryDelay: 500, recursive: true, force: true});
  }
}

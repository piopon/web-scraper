import { DataRouter } from "../../../src/routes/api/data-router.js";

import supertest from "supertest";
import passport from "passport";
import express from "express";
import session from "express-session";
import path from "path";
import fs from "fs";

import { Strategy } from "passport-local";

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
    const mockAuth = { mail: "owner", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.get("/data/unknown");
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
      // [
      //   "query is empty",
      //   {},
      //   {
      //     status: 400,
      //     response: [
      //       {
      //         instancePath: "",
      //         keyword: "required",
      //         message: "must have required property 'owner'",
      //         params: { missingProperty: "owner" },
      //         schemaPath: "#/required",
      //       },
      //     ],
      //   },
      // ],
      // [
      //   "query contains invalid user",
      //   { owner: "invalid" },
      //   {
      //     status: 400,
      //     response: "Invalid data owner provided",
      //   },
      // ],
      // [
      //   "query contains valid user",
      //   { owner: "owner" },
      //   {
      //     status: 200,
      //     response: [
      //       {
      //         name: "clothes",
      //         category: "👕",
      //         items: [
      //           {
      //             status: "OK",
      //             name: "t-shirt Regular Fit",
      //             icon: "",
      //             price: "29.99",
      //             currency: "PLN",
      //           },
      //         ],
      //       },
      //       {
      //         name: "games",
      //         category: "🎮",
      //         items: [
      //           {
      //             status: "OK",
      //             name: "Diablo IV",
      //             icon: "",
      //             price: "349.99",
      //             currency: "PLN",
      //           },
      //         ],
      //       },
      //     ],
      //   },
      // ],
      // [
      //   "query contains existing name",
      //   { owner: "owner", name: "clothes" },
      //   {
      //     status: 200,
      //     response: [
      //       {
      //         name: "clothes",
      //         category: "👕",
      //         items: [
      //           {
      //             status: "OK",
      //             name: "t-shirt Regular Fit",
      //             icon: "",
      //             price: "29.99",
      //             currency: "PLN",
      //           },
      //         ],
      //       },
      //     ],
      //   },
      // ],
      // [
      //   "query contains not existing name",
      //   { owner: "owner", name: "unknown" },
      //   {
      //     status: 200,
      //     response: [],
      //   },
      // ],
      // [
      //   "query contains existing category",
      //   { owner: "owner", category: "🎮" },
      //   {
      //     status: 200,
      //     response: [
      //       {
      //         name: "games",
      //         category: "🎮",
      //         items: [
      //           {
      //             status: "OK",
      //             name: "Diablo IV",
      //             icon: "",
      //             price: "349.99",
      //             currency: "PLN",
      //           },
      //         ],
      //       },
      //     ],
      //   },
      // ],
      // [
      //   "query contains not existing category",
      //   { owner: "owner", category: "unknown" },
      //   {
      //     status: 200,
      //     response: [],
      //   },
      // ],
      // [
      //   "query contains existing and matching name and category",
      //   { owner: "owner", name: "games", category: "🎮" },
      //   {
      //     status: 200,
      //     response: [
      //       {
      //         name: "games",
      //         category: "🎮",
      //         items: [
      //           {
      //             status: "OK",
      //             name: "Diablo IV",
      //             icon: "",
      //             price: "349.99",
      //             currency: "PLN",
      //           },
      //         ],
      //       },
      //     ],
      //   },
      // ],
      // [
      //   "query contains existing but not matching name and category",
      //   { owner: "owner", name: "games", category: "👕" },
      //   {
      //     status: 200,
      //     response: [],
      //   },
      // ],
      // [
      //   "query contains existing name and not existing category",
      //   { owner: "owner", name: "games", category: "unknown" },
      //   {
      //     status: 200,
      //     response: [],
      //   },
      // ],
      // [
      //   "query contains not existing name and existing category",
      //   { owner: "owner", name: "unknown", category: "👕" },
      //   {
      //     status: 200,
      //     response: [],
      //   },
      // ],
      // [
      //   "query contains not existing name and category",
      //   { owner: "owner", name: "unknown", category: "unknown" },
      //   {
      //     status: 200,
      //     response: [],
      //   },
      // ],
    ])("%s", async (_, inputQuery, expected) => {
      const response = await testAgent.get("/data").query(inputQuery);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
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

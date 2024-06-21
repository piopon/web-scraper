import { ConfigRouter } from "../../../src/routes/api/config-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { ScrapConfig } from "../../../src/model/scrap-config.js";
import { LogLevel } from "../../../config/app-types.js";

import supertest from "supertest";
import passport from "passport";
import express from "express";
import session from "express-session";
import { jest } from "@jest/globals";
import { Strategy } from "passport-local";

jest.mock("../../../src/model/scrap-config.js");

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/", method: "get" },
      { path: "/groups", method: "get" },
      { path: "/groups/observers", method: "get" },
      { path: "/groups/observers/components", method: "get" },
      { path: "/groups", method: "put" },
      { path: "/groups/observers", method: "put" },
      { path: "/groups", method: "post" },
      { path: "/groups/observers", method: "post" },
      { path: "/groups", method: "delete" },
      { path: "/groups/observers", method: "delete" },
    ];
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const testRouter = new ConfigRouter(components);
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
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const mockResult = { findById: (configId) => getInitConfig(false, configId, "uname") };
  jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
  // configue test express app server
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/config", new ConfigRouter(components).createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.get("/configs/unknown");
    expect(response.statusCode).toBe(404);
  });
  test("returns correct result for path '/'", async () => {
    const response = await testAgent.get("/config");
    expect(response.statusCode).toBe(200);
    const expectedContent = getInitConfig(false, 123, "uname");
    expect(response.body).toStrictEqual(expectedContent);
  });
  describe("returns correct result using /config/groups endpoint with", () => {
    it.each([
      ["filter: NONE", undefined],
      ["filter: ?name=test1", { name: "test1" }],
      ["filter: ?name=unknown", { name: "unknown" }],
      ["filter: ?category=@@@", { category: "@@@" }],
      ["filter: ?category=unknown", { category: "unknown" }],
      ["filter: ?domain=test.com", { domain: "test.com" }],
      ["filter: ?domain=unknown", { domain: "unknown" }],
      ["filter: ?name=test1&category=$$$", { name: "test1", category: "$$$" }],
      ["filter: ?name=test1&category=@@@", { name: "test1", category: "@@@" }],
      ["filter: ?name=test1&domain=test.com", { name: "test1", domain: "test.com" }],
      ["filter: ?name=test1&domain=unknown.com", { name: "test1", domain: "unknown.com" }],
      ["filter: ?category=$$$&domain=test.com", { category: "$$$", domain: "test.com" }],
      ["filter: ?category=unknown&domain=test.com", { category: "unknown", domain: "test.com" }],
      ["filter: ?name=test1&category=@@@&domain=test.com", { name: "test1", category: "@@@", domain: "test.com" }],
      ["filter: ?name=test2&category=@@@&domain=test.com", { name: "test2", category: "@@@", domain: "test.com" }],
    ])("%s", async (_, filterObj) => {
      const response = await testAgent.get("/config/groups").query(filterObj);
      expect(response.statusCode).toBe(200);
      const expectedContent = filterConfig(getInitConfig(false, 123, "uname").groups, filterObj);
      expect(response.body).toStrictEqual(expectedContent);
    });
  });
  describe("returns correct result using /config/groups/observers endpoint with", () => {
    it.each([
      ["filter: NONE", undefined],
      ["filter: ?name=logo", { name: "logo" }],
      ["filter: ?name=unknown", { name: "unknown" }],
      ["filter: ?path=status", { path: "status" }],
      ["filter: ?path=unknown", { path: "unknown" }],
      ["filter: ?target=domcontentloaded", { target: "domcontentloaded" }],
      ["filter: ?target=networkidle2", { target: "networkidle2" }],
      ["filter: ?history=onChange", { history: "onChange" }],
      ["filter: ?history=on", { history: "on" }],
      ["filter: ?name=logo&path=status", { name: "logo", path: "status" }],
      ["filter: ?name=logo&target=load", { name: "logo", target: "load" }],
      ["filter: ?name=logo&history=off", { name: "logo", history: "off" }],
      ["filter: ?path=status&target=domcontentloaded", { path: "status", target: "domcontentloaded" }],
      ["filter: ?path=status&history=off", { path: "status", history: "off" }],
      ["filter: ?target=load&history=off", { target: "load", history: "off" }],
      ["filter: ?name=logo&path=status&target=load", { name: "logo", path: "status", target: "load" }],
      ["filter: ?name=logo&path=status&history=off", { name: "logo", path: "status", history: "off" }],
      ["filter: ?path=status&target=load&history=off", { path: "status", target: "load", history: "off" }],
      [
        "filter: ?name=logo&path=status&target=load&history=off",
        { name: "logo", path: "status", target: "load", history: "off" },
      ],
    ])("%s", async (_, filterObj) => {
      const response = await testAgent.get("/config/groups/observers").query(filterObj);
      expect(response.statusCode).toBe(200);
      const expectedContent = filterConfig(
        getInitConfig(false, 123, "uname").groups.flatMap((group) => group.observers),
        filterObj
      );
      expect(response.body).toStrictEqual(expectedContent);
    });
    test("target value outside accepted values", async () => {
      const filterObj = { target: "unknown" };
      const response = await testAgent.get("/config/groups/observers").query(filterObj);
      expect(response.statusCode).toBe(400);
      const expectedErrorJson = [
        {
          instancePath: "/target",
          keyword: "enum",
          message: "must be equal to one of the allowed values",
          params: { allowedValues: ["load", "domcontentloaded", "networkidle0", "networkidle2"] },
          schemaPath: "#/properties/target/enum",
        },
      ];
      expect(response.body).toStrictEqual(expectedErrorJson);
    });
    test("history value outside accepted values", async () => {
      const filterObj = { history: "unknown" };
      const response = await testAgent.get("/config/groups/observers").query(filterObj);
      expect(response.statusCode).toBe(400);
      const expectedErrorJson = [
        {
          instancePath: "/history",
          keyword: "enum",
          message: "must be equal to one of the allowed values",
          params: { allowedValues: ["off", "on", "onChange"] },
          schemaPath: "#/properties/history/enum",
        },
      ];
      expect(response.body).toStrictEqual(expectedErrorJson);
    });
  });
  describe("returns correct result using /config/groups/observers/components endpoint with", () => {
    it.each([
      ["source: title, filter: NONE", "title", undefined],
      ["source: image, filter: NONE", "image", undefined],
      ["source: price, filter: NONE", "price", undefined],
      ["source: price, filter: ?interval=5m", "price", { interval: "5m" }],
      ["source: price, filter: ?selector=body", "price", { selector: "body" }],
      ["source: price, filter: ?attribute=innerHTML", "price", { attribute: "innerHTML" }],
      ["source: price, filter: ?auxiliary=PLN", "price", { auxiliary: "PLN" }],
      ["source: price, filter: ?interval=1h&selector=body", "price", { interval: "1h", selector: "body" }],
      ["source: price, filter: ?interval=1h&attribute=innerHTML", "price", { interval: "1h", attribute: "innerHTML" }],
      ["source: price, filter: ?interval=1h&auxiliary=USD", "price", { interval: "1h", auxiliary: "USD" }],
      ["source: price, filter: ?selector=body&auxiliary=USD", "price", { selector: "body", auxiliary: "USD" }],
      [
        "source: price, filter: ?selector=body&attribute=innerHTML",
        "price",
        { selector: "body", attribute: "innerHTML" },
      ],
      [
        "source: price, filter: ?attribute=innerHTML&auxiliary=USD",
        "price",
        { attribute: "innerHTML", auxiliary: "USD" },
      ],
      [
        "source: price, filter: ?interval=5m&selector=body&attribute=innerHTML",
        "price",
        { interval: "5m", selector: "body", attribute: "innerHTML" },
      ],
      [
        "source: price, filter: ?interval=5m&selector=body&auxiliary=USD",
        "price",
        { interval: "5m", selector: "body", auxiliary: "USD" },
      ],
      [
        "source: price, filter: ?interval=5m&attribute=innerHTML&auxiliary=PLN",
        "price",
        { interval: "5m", attribute: "innerHTML", auxiliary: "PLN" },
      ],
      [
        "source: price, filter: ?selector=body&attribute=innerHTML&auxiliary=USD",
        "price",
        { selector: "body", attribute: "innerHTML", auxiliary: "USD" },
      ],
      [
        "source: price, filter: ?interval=1h&selector=body&attribute=innerHTML&auxiliary=USD",
        "price",
        { interval: "1h", selector: "body", attribute: "innerHTML", auxiliary: "USD" },
      ],
    ])("%s", async (_, source, filterObj) => {
      const queryObj = { source: source, ...filterObj };
      const response = await testAgent.get("/config/groups/observers/components").query(queryObj);
      expect(response.statusCode).toBe(200);
      const expectedContent = filterConfig(
        getInitConfig(false, 123, "uname")
          .groups.flatMap((group) => group.observers)
          .map((observer) => observer[source]),
        filterObj
      ).map((item) => (item === undefined ? null : item));
      expect(response.body).toStrictEqual(expectedContent);
    });
  });
});

describe("created config PUT routes", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const mockResult = { findById: (configId) => getInitConfig(true, configId, "uname") };
  jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
  // configue test express app server
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/config", new ConfigRouter(components).createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.put("/configs/unknown");
    expect(response.statusCode).toBe(404);
  });
  describe("returns correct result using /config/groups endpoint when", () => {
    const price = createComponent("1D", "title", "innerText", "CAD");
    const observer = createObserver(false, "logo", "info", "load", "off", price);
    const inputObject = createGroup(false, "test1", "%%%", "new.com", observer);
    it.each([
      [
        "query is empty",
        {},
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "query and body IDs are compatible",
        { query: { name: "test1" }, body: inputObject },
        { status: 200, response: "Edited configuration element with name = test1" },
      ],
      [
        "query and body IDs are incompatible",
        { query: { name: "test2" }, body: inputObject },
        { status: 400, response: "Incompatible query (name = test2) and body (name = test1) identifiers" },
      ],
      [
        "query ID does not exist",
        { query: { name: "test3" }, body: inputObject },
        { status: 400, response: "Could not find the specifed element" },
      ],
      [
        "body is empty",
        {},
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "body has invalid structure",
        observer,
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
    ])("%s", async (_, input, expected) => {
      const response = await testAgent.put("/config/groups").query(input.query).send(input.body);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
  describe("returns correct result using /config/groups/observers endpoint when", () => {
    const price = createComponent("1D", "title", "innerText", "CAD");
    const inputObject = createObserver(false, "logo", "info", "load", "off", price);
    it.each([
      [
        "query is empty",
        {},
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "query has invalid structure",
        { unknown: "observer" },
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "query and body IDs are compatible",
        { query: { name: "logo" }, body: inputObject },
        { status: 200, response: "Edited configuration element with name = logo" },
      ],
      [
        "query and body IDs are incompatible",
        { query: { name: "text" }, body: inputObject },
        { status: 400, response: "Incompatible query (name = text) and body (name = logo) identifiers" },
      ],
      [
        "query ID does not exist",
        { query: { name: "test" }, body: inputObject },
        { status: 400, response: "Could not find the specifed element" },
      ],
      [
        "body is empty",
        {},
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "body has invalid structure",
        price,
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
    ])("%s", async (_, input, expected) => {
      const response = await testAgent.put("/config/groups/observers").query(input.query).send(input.body);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
});

describe("created config POST routes", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const mockResult = { findById: (configId) => getInitConfig(true, configId, "uname") };
  jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
  // configue test express app server
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/config", new ConfigRouter(components).createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.post("/configs/unknown");
    expect(response.statusCode).toBe(404);
  });
  describe("returns correct result using /config/groups endpoint when", () => {
    const price = createComponent("1D", "title", "innerText", "CAD");
    const observer = createObserver(false, "new-observer", "info", "load", "off", price);
    it.each([
      [
        "query ID does not exist",
        createGroup(false, "new-group", "???", "test.com", observer),
        { status: 200, response: "Added new configuration element with name = new-group" },
      ],
      [
        "query ID already exist",
        createGroup(false, "test1", "%%%", "new.com", observer),
        { status: 400, response: "Element with identifier name = test1 already exists" },
      ],
      [
        "body is empty",
        {},
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "body has invalid structure",
        observer,
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'domain'",
              params: { missingProperty: "domain" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
    ])("%s", async (_, requestBody, expected) => {
      const response = await testAgent.post("/config/groups").send(requestBody);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
  describe("returns correct result using /config/groups/observers endpoint when", () => {
    const price = createComponent("1D", "title", "innerText", "CAD");
    const inputObserver = createObserver(false, "new-observer", "info", "load", "off", price);
    it.each([
      [
        "query is empty",
        { query: {}, body: inputObserver },
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'parent'",
              params: { missingProperty: "parent" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "query parent ID does exist",
        { query: { parent: "test1" }, body: inputObserver },
        { status: 200, response: "Added new configuration element with name = new-observer" },
      ],
      [
        "query parent ID does not exist",
        { query: { parent: "test123" }, body: inputObserver },
        { status: 400, response: "Undefined parent of new element" },
      ],
    ])("%s", async (_, input, expected) => {
      const response = await testAgent.post("/config/groups/observers").query(input.query).send(input.body);
      expect(response.statusCode).toBe(expected.status);
      expect(response.body).toStrictEqual(expected.response);
    });
  });
});

describe("created config DELETE routes", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const mockResult = { findById: (configId) => getInitConfig(true, configId, "uname") };
  jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementation(() => mockResult);
  // configue test express app server
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/config", new ConfigRouter(components).createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.delete("/configs/unknown");
    expect(response.statusCode).toBe(404);
  });
  describe("returns correct result using /config/groups endpoint when", () => {
    it.each([
      [
        "query is empty",
        {},
        {
          status: 400,
          response: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'name'",
              params: { missingProperty: "name" },
              schemaPath: "#/required",
            },
          ],
        },
      ],
      [
        "query ID does exist",
        { name: "test1" },
        { status: 200, response: "Removed configuration element with name = test1" },
      ],
      ["query ID does not exist", { name: "test123" }, { status: 400, response: "Could not find item to delete" }],
    ])("%s", async (_, requestQuery, expected) => {
      const response = await testAgent.delete("/config/groups").query(requestQuery);
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

function filterConfig(array, filter) {
  if (filter == null) {
    return array;
  }
  let result = array;
  for (const [key, value] of Object.entries(filter)) {
    result = result.filter((element) => element[key] === value);
  }
  return result;
}

function createGroup(db, name, category, domain, ...observers) {
  return {
    name: name,
    category: category,
    domain: domain,
    observers: observers,
    ...(db && { getIdentifier: () => `name = ${name}` }),
    ...(db && { copyValues: (_) => true }),
  };
}

function createObserver(db, name, path, target, history, ...components) {
  return {
    name: name,
    path: path,
    target: target,
    history: history,
    ...(components[0] && { price: components[0] }),
    ...(components[1] && { title: components[1] }),
    ...(components[2] && { image: components[2] }),
    ...(db && { getIdentifier: () => `name = ${name}` }),
    ...(db && { copyValues: (_) => true }),
  };
}

function createComponent(interval, selector, attribute, auxiliary) {
  return { interval: interval, selector: selector, attribute: attribute, auxiliary: auxiliary };
}

function getInitConfig(db, configId, name) {
  const component1 = createComponent("5m", "body p b", "innerHTML", "PLN");
  const component2 = createComponent("1h", "body p b", "innerHTML", "USD");
  const observer1 = createObserver(db, "logo", "info", "load", "off", component1);
  const observer2 = createObserver(db, "text", "status", "domcontentloaded", "onChange", component2);
  return {
    id: configId,
    user: name,
    groups: [
      createGroup(db, "test1", "$$$", "test.com", observer1),
      createGroup(db, "test2", "@@@", "test.com", observer2),
    ],
    ...(db && { getIdentifier: () => `name = ${name}` }),
    ...(db && { copyValues: (_) => true }),
    ...(db && { save: () => true }),
  };
}

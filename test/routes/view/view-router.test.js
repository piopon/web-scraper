import { ViewRouter } from "../../../src/routes/view/view-router.js";

import supertest from "supertest";
import passport from "passport";
import express from "express";
import session from "express-session";
import helpers from "handlebars-helpers";
import { engine } from "express-handlebars";
import { Strategy } from "passport-local";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/", method: "get" },
      { path: "/status", method: "get" },
    ];
    const testRouter = new ViewRouter();
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
  // configue test express app server
  const testApp = express();
  testApp.engine("handlebars", engine({ helpers: helpers() }));
  testApp.set("view engine", "handlebars");
  testApp.set("views", "./public");
  testApp.use(express.static("./public"));
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(session({ secret: "unit_tests", resave: false, saveUninitialized: false }));
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  testApp.use("/view", new ViewRouter().createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // create test client to call server requests
  const testClient = supertest(testApp);
  test("returns correct result for unknown path", async () => {
    const response = await testClient.get("/view/unknown");
    expect(response.statusCode).toBe(404);
  });
  test("returns correct result using /view/status endpoint", async () => {
    const response = await testClient.get("/view/status");
    expect(response.statusCode).toBe(200);
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
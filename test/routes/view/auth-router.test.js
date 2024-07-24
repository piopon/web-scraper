import { AuthRouter } from "../../../src/routes/view/auth-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../config/app-types.js";

import supertest from "supertest";
import passport from "passport";
import express from "express";
import session from "express-session";
import helpers from "handlebars-helpers";
import { engine } from "express-handlebars";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [
      { path: "/register", method: "get" },
      { path: "/login", method: "get" },
      { path: "/register", method: "post" },
      { path: "/login", method: "post" },
      { path: "/logout", method: "post" },
    ];
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const testRouter = new AuthRouter(components, passport);
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

describe("created auth GET routes", () => {
  const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
  const testRouter = new AuthRouter(components, passport);
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
  testApp.use("/auth", testRouter.createRoutes());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.get("/auth/unknown");
    expect(response.statusCode).toBe(404);
  });
  test("returns correct result using /register endpoint", async () => {
    const response = await testAgent.get("/auth/register");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("text/html");
    expect(response.text).toEqual(expect.not.arrayContaining(["", null, undefined]));
  });
});

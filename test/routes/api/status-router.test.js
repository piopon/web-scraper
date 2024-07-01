import { StatusRouter } from "../../../src/routes/api/status-router.js";
import { WebComponents } from "../../../src/components/web-components.js";
import { LogLevel } from "../../../config/app-types.js";

describe("createRoutes() method", () => {
  test("returns correct number of routes", () => {
    const expectedRoutes = [{ path: "/", method: "get" }];
    const serverHistory = {};
    const serverStatus = { getName: () => "Running", getHistory: () => serverHistory };
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const testRouter = new StatusRouter(serverStatus, components);
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
  const serverHistory = {};
  const serverStatus = { getName: () => "Running", getHistory: () => serverHistory };
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
  testApp.use("/status", new StatusRouter(serverStatus, components).createRoutes());
  testApp.use("/auth", createMockAuthRouter());
  // retrieve underlying superagent to correctly persist sessions
  const testAgent = supertest.agent(testApp);
  beforeAll(async () => {
    const mockAuth = { mail: "test@mail.com", pass: "test-secret" };
    await testAgent.post("/auth/login").send(mockAuth);
  });
  test("returns correct result for unknown path", async () => {
    const response = await testAgent.get("/status/unknown");
    expect(response.statusCode).toBe(404);
  });
});

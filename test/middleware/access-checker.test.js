import { AccessChecker } from "../../src/middleware/access-checker.js";
import { ScrapUser } from "../../src/model/scrap-user.js";
import { jest } from "@jest/globals";

describe("canReceiveData() method", () => {
  test("shouldn't do anything when authorized", async () => {
    const invokeState = { status: 200, text: "", next: false };
    const requestObj = {
      isAuthenticated: () => true,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.status = 401;
                invokeState.text = "Unauthroized";
                invokeState.next = false;
              };
            },
          },
        },
      },
    };
    const mockedRes = {
      status: (input) => {
        invokeState.status = input;
        return { json: (input) => (invokeState.text = input) };
      },
    };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canReceiveData(requestObj, mockedRes, mockedNext);
    expect(invokeState.status).toBe(200);
    expect(invokeState.text).toBe("");
    expect(invokeState.next).toBe(true);
  });
  test("should throw error 401 when not authorized", async () => {
    const invokeState = { status: 200, text: "", next: false };
    const requestObj = {
      isAuthenticated: () => false,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.status = 401;
                invokeState.text = "Unauthroized";
                invokeState.next = false;
              };
            },
          },
        },
      },
    };
    const mockedRes = {
      status: (input) => {
        invokeState.status = input;
        return { json: (input) => (invokeState.text = input) };
      },
    };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canReceiveData(requestObj, mockedRes, mockedNext);
    expect(invokeState.status).toBe(401);
    expect(invokeState.text).toBe("Unauthroized");
    expect(invokeState.next).toBe(false);
  });
});

describe("canViewContent() method", () => {
  test("should not redirect when authorized", async () => {
    const invokeState = { redirect: "", next: false };
    const requestObj = {
      isAuthenticated: () => true,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.redirect = "/auth/login";
                invokeState.next = false;
              };
            },
          },
        },
      },
      query: {
        challenge: "mocked-challenge",
      },
    };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewContent(requestObj, mockedRes, mockedNext);
    expect(invokeState.redirect).toBe("");
    expect(invokeState.next).toBe(true);
  });
  test("should redirect when not authorized via remote-login", async () => {
    const invokeState = { name: "", redirect: "", next: false };
    const requestObj = {
      isAuthenticated: () => false,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.name = name;
                invokeState.redirect = "/auth/login";
                invokeState.next = false;
              };
            },
          },
        },
      },
      query: {
        challenge: "mocked-challenge",
      },
    };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewContent(requestObj, mockedRes, mockedNext);
    expect(invokeState.name).toBe("remote-login");
    expect(invokeState.redirect).toBe("/auth/login");
    expect(invokeState.next).toBe(false);
  });
  test("should redirect when not authorized via jwt", async () => {
    const invokeState = { name: "", redirect: "", next: false };
    const requestObj = {
      isAuthenticated: () => false,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.name = name;
                invokeState.redirect = "/auth/login";
                invokeState.next = false;
              };
            },
          },
        },
      },
      query: {},
    };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewContent(requestObj, mockedRes, mockedNext);
    expect(invokeState.name).toBe("jwt");
    expect(invokeState.redirect).toBe("/auth/login");
    expect(invokeState.next).toBe(false);
  });

  test("should mark remote logout and attach demo user when present", async () => {
    const invokeState = { name: "", redirect: "", nextCalls: 0 };
    const demoUser = { email: "demo@test.com" };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => ({
      findOne: async () => demoUser,
    }));

    const requestObj = {
      isAuthenticated: () => false,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.name = name;
                invokeState.redirect = "/auth/login";
              };
            },
          },
        },
      },
      query: {},
      url: "/logout",
      body: {
        "demo-user": "demo",
        "demo-pass": "secret",
      },
    };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.nextCalls += 1);

    await AccessChecker.canViewContent(requestObj, mockedRes, mockedNext);

    expect(requestObj.remoteLogout).toBe(true);
    expect(requestObj.user).toStrictEqual(demoUser);
    expect(invokeState.nextCalls).toBe(1);
    expect(invokeState.name).toBe("jwt");
  });

  test("should mark remote logout and keep user undefined when demo user missing", async () => {
    const invokeState = { name: "", redirect: "", nextCalls: 0 };
    jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => ({
      findOne: async () => null,
    }));

    const requestObj = {
      isAuthenticated: () => false,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.name = name;
                invokeState.redirect = "/auth/login";
              };
            },
          },
        },
      },
      query: {},
      url: "/logout",
      body: {
        "demo-user": "demo",
        "demo-pass": "secret",
      },
    };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.nextCalls += 1);

    await AccessChecker.canViewContent(requestObj, mockedRes, mockedNext);

    expect(requestObj.remoteLogout).toBe(true);
    expect(requestObj.user).toBe(undefined);
    expect(invokeState.nextCalls).toBe(1);
    expect(invokeState.name).toBe("jwt");
  });
});

describe("canViewSessionUser() method", () => {
  test("should not redirect when not authorized", async () => {
    const invokeState = { redirect: "", next: false };
    const requestObj = {
      isAuthenticated: () => false,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.redirect = "/";
                invokeState.next = false;
              };
            },
          },
        },
      },
    };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewSessionUser(requestObj, mockedRes, mockedNext);
    expect(invokeState.redirect).toBe("");
    expect(invokeState.next).toBe(true);
  });
  test("should redirect when authorized", async () => {
    const invokeState = { redirect: "", next: false };
    const requestObj = {
      isAuthenticated: () => true,
      app: {
        locals: {
          passport: {
            authenticate: (name, options) => {
              return (req, res, next) => {
                invokeState.redirect = "/";
                invokeState.next = false;
              };
            },
          },
        },
      },
    };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewSessionUser(requestObj, mockedRes, mockedNext);
    expect(invokeState.redirect).toBe("/");
    expect(invokeState.next).toBe(false);
  });
});

import { AccessChecker } from "../../src/middleware/access-checker.js";

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
              }
            },
          },
        },
      }
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
              }
            },
          },
        },
      }
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
    const requestObj = { isAuthenticated: () => true };
    const invokeState = { redirect: "", next: false };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewContent(requestObj, mockedRes, mockedNext);
    expect(invokeState.redirect).toBe("");
    expect(invokeState.next).toBe(true);
  });
  test("should redirect when not authorized", async () => {
    const requestObj = { isAuthenticated: () => false };
    const invokeState = { redirect: "", next: false };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewContent(requestObj, mockedRes, mockedNext);
    expect(invokeState.redirect).toBe("/auth/login");
    expect(invokeState.next).toBe(false);
  });
});

describe("canViewSessionUser() method", () => {
  test("should not redirect when not authorized", async () => {
    const requestObj = { isAuthenticated: () => false };
    const invokeState = { redirect: "", next: false };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewSessionUser(requestObj, mockedRes, mockedNext);
    expect(invokeState.redirect).toBe("");
    expect(invokeState.next).toBe(true);
  });
  test("should redirect when authorized", async () => {
    const requestObj = { isAuthenticated: () => true };
    const invokeState = { redirect: "", next: false };
    const mockedRes = { redirect: (input) => (invokeState.redirect = input) };
    const mockedNext = () => (invokeState.next = true);
    AccessChecker.canViewSessionUser(requestObj, mockedRes, mockedNext);
    expect(invokeState.redirect).toBe("/");
    expect(invokeState.next).toBe(false);
  });
});

import { AccessChecker } from "../../src/middleware/access-checker.js";

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

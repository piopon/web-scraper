import { ParamsParser } from "../../src/middleware/params-parser.js";

import { jest } from "@jest/globals";

describe("middleware() method", () => {
  test("should correctly parse unsigned integer in params", async () => {
    const requestObj = { params: { p1: "123", p2: "test" }, query: { p3: "-123" } };
    const mockedRes = jest.fn();
    const mockedNext = jest.fn();
    ParamsParser.middleware(requestObj, mockedRes, mockedNext);
    expect(requestObj.params.p1).toBe(123);
    expect(requestObj.params.p2).toBe("test");
    expect(requestObj.query.p3).toBe(-123);
  });
  test("should correctly parse unsigned integer in query", async () => {
    const requestObj = { params: { p1: "-123", p2: "test" }, query: { p3: "123" } };
    const mockedRes = jest.fn();
    const mockedNext = jest.fn();
    ParamsParser.middleware(requestObj, mockedRes, mockedNext);
    expect(requestObj.params.p1).toBe(-123);
    expect(requestObj.params.p2).toBe("test");
    expect(requestObj.query.p3).toBe(123);
  });
  test("should correctly parse boolean in params", async () => {
    const requestObj = { params: { p1: "true", p2: "tru" }, query: { p3: "123" } };
    const mockedRes = jest.fn();
    const mockedNext = jest.fn();
    ParamsParser.middleware(requestObj, mockedRes, mockedNext);
    expect(requestObj.params.p1).toBe(true);
    expect(requestObj.params.p2).toBe("tru");
    expect(requestObj.query.p3).toBe(123);
  });
  test("should correctly parse boolean in params", async () => {
    const requestObj = { params: { p1: "123", p2: "tru" }, query: { p3: "false" } };
    const mockedRes = jest.fn();
    const mockedNext = jest.fn();
    ParamsParser.middleware(requestObj, mockedRes, mockedNext);
    expect(requestObj.params.p1).toBe(123);
    expect(requestObj.params.p2).toBe("tru");
    expect(requestObj.query.p3).toBe(false);
  });
});

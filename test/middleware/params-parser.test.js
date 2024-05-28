import { ParamsParser } from "../../src/middleware/params-parser.js"

import { jest } from "@jest/globals";

describe("middleware() method", () => {
  test("should correctly parse unsigned integer in params", async () => {
    const requestObj = { params: {param1: "123"} };
    const mockedRes = jest.fn();
    const mockedNext = jest.fn();
    ParamsParser.middleware(requestObj, mockedRes, mockedNext);
    expect(requestObj.params.param1).toBe(123);
  });
});
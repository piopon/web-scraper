import { RequestLogger } from "../../src/middleware/request-logger.js";
import { StatusLogger } from "../../src/components/status-logger.js";
import { LogLevel } from "../../config/app-types.js";

import { jest } from "@jest/globals";

test("middleware() should correctly log request using logger", async () => {
  const logger = new StatusLogger("test", LogLevel.DEBUG);
  const requestObj = { method: "TEMP", protocol: "proto", originalUrl: "url", get: (input) => "host/" };
  const mockedNext = jest.fn();
  const middlewareObj = RequestLogger.middleware(logger);
  middlewareObj(requestObj, jest.fn(), mockedNext);
  const result = logger.getHistory();
  expect(result.length).toBe(1);
});

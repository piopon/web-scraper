import { WebServer } from "../../src/components/web-server.js";
import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel } from "../../config/app-types.js";

import { jest } from "@jest/globals";
import express from "express";

const listenMock = jest.fn();
const expressMock = jest.fn(() => ({
  listen: listenMock
}));

jest.mock('express', () => expressMock);

test("run() should start the server by calling listen() exactly once", async () => {
  jest.clearAllMocks();
  const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
  const testServer = new WebServer(config, new WebComponents(config));

  await testServer.run();
  expect(expressMock).toHaveBeenCalledTimes(1);
  expect(listenMock).toHaveBeenCalledTimes(1);
  expect(listenMock).toHaveBeenCalledWith(123, expect.any(Function));
});
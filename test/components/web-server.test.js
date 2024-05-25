import { WebServer } from "../../src/components/web-server.js";
import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel } from "../../config/app-types.js";

import { jest } from "@jest/globals";
import express from "express";

test("run() should start the server by calling listen() exactly once", async () => {
  const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
  const testServer = new WebServer(config, new WebComponents(config));
  const listenMock = jest.fn();
  jest.mock('express', () => {
    return jest.fn(() => ({
      listen: listenMock
    }));
  });
  await testServer.run();

  expect(listenMock).toHaveBeenCalledTimes(1);
  expect(listenMock).toHaveBeenCalledWith(123, expect.any(Function));
});
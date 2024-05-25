import { WebServer } from "../../src/components/web-server.js";
import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel } from "../../config/app-types.js";

import express from "express";

test("run() should start the server by calling listen() exactly once", async () => {
  const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
  const testServer = new WebServer(config, new WebComponents(config));
  await testServer.run();

  // Get the mocked express instance
  const mockedExpressInstance = express();
  // Check if the listen method was called once
  expect(mockedExpressInstance.listen).toHaveBeenCalledTimes(1);
  // Optionally, check if listen was called with the correct port
  expect(mockedExpressInstance.listen).toHaveBeenCalledWith(3000, expect.any(Function));
});
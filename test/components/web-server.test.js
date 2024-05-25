import { WebServer } from "../../src/components/web-server.js";
import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel } from "../../config/app-types.js";

test("run() should start the server and not throw", async () => {
  const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
  const testServer = new WebServer(config, new WebComponents(config));
  await expect(testServer.run()).resolves.not.toThrowError();
});
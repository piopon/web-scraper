import { WebServer } from "../../src/components/web-server.js";
import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel } from "../../config/app-types.js";

test("run() should start the server and not throw", async () => {
  const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
  const testServer = new WebServer(config, new WebComponents(config));
  try {
    const result = await testServer.run();
    expect(result).toBe(true);
    testServer.shutdown();
  } catch (error) {
    fail("Run should NOT throw");
  }
});
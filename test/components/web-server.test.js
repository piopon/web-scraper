import { WebServer } from "../../src/components/web-server.js";
import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel } from "../../config/app-types.js";

describe("run() method", () => {
  test("should start server and not throw when no INIT components", async () => {
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
  test("should start server and not throw when INIT components start", async () => {
    const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
    const components = new WebComponents(config);
    components.addComponent({
      getName: () => "init-component",
      getInfo: () => ({ types: [ComponentType.INIT], initWait: true }),
      start: () => true,
      stop: () => true,
    });
    const testServer = new WebServer(config, components);
    try {
      const result = await testServer.run();
      expect(result).toBe(true);
      testServer.shutdown();
    } catch (error) {
      fail("Run should NOT throw");
    }
  });
});

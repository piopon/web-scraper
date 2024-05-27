import { WebServer } from "../../src/components/web-server.js";
import { WebComponents } from "../../src/components/web-components.js";
import { ComponentType, LogLevel } from "../../config/app-types.js";

describe("run() method", () => {
  test("should start server and not throw when no INIT components", async () => {
    const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
    const components = new WebComponents(config);
    const testServer = new WebServer(config, components);
    try {
      const result = await testServer.run();
      testServer.shutdown();
      expect(result).toBe(true);
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
      testServer.shutdown();
      expect(result).toBe(true);
    } catch (error) {
      fail("Run should NOT throw");
    }
  });
  test("should fail to start server when INIT components does not start", async () => {
    const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
    const components = new WebComponents(config);
    components.addComponent({
      getName: () => "init-component",
      getInfo: () => ({ types: [ComponentType.INIT], initWait: true }),
      start: () => false,
      stop: () => false,
    });
    const testServer = new WebServer(config, components);
    try {
      const result = await testServer.run();
      testServer.shutdown();
      expect(result).toBe(false);
    } catch (error) {
      fail("Run should NOT throw");
    }
  });
});

describe("shutdown() method", () => {
  test("does not trow when session started", async () => {
    const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
    const components = new WebComponents(config);
    const testServer = new WebServer(config, components);
    await testServer.run();
    try {
      testServer.shutdown();
    } catch (error) {
      fail("Shutdown should NOT throw when session was started");
    }
  });
  test("does not throw when session not started", async () => {
    const config = { minLogLevel: LogLevel.INFO, serverConfig: { port: 123 } };
    const components = new WebComponents(config);
    const testServer = new WebServer(config, components);
    try {
      testServer.shutdown();
    } catch (error) {
      fail("Shutdown should NOT throw when session was not started");
    }
  });
});

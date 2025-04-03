import { AppConfig } from "../../src/config/app-config.js";
import { LogLevel } from "../../src/config/app-types.js";

import path from "path";

describe("getConfig", () => {
  test("returns correct result with default values", () => {
    const testConfig = new AppConfig().getConfig();
    expect(testConfig.jsonDataConfig).not.toBe(null);
    expect(testConfig.jsonDataConfig.path).toMatch("web-scraper" + path.sep + "docs" + path.sep + "json");
    expect(testConfig.jsonDataConfig.config).toMatch("config.json");
    expect(testConfig.jsonDataConfig.data).toMatch("data.json");
    expect(testConfig.usersDataConfig).not.toBe(null);
    expect(testConfig.usersDataConfig.path).toMatch("web-scraper" + path.sep + "users");
    expect(testConfig.usersDataConfig.file).toMatch("data.json");
    expect(testConfig.minLogLevel).toBe(LogLevel.INFO);
    expect(testConfig.serverConfig).not.toBe(null);
    expect(testConfig.serverConfig.port).toBe(5000);
    expect(testConfig.databaseConfig).not.toBe(null);
    expect(testConfig.databaseConfig.url).toBe("localhost");
    expect(testConfig.databaseConfig.name).toBe("web-scraper");
    expect(testConfig.databaseConfig.port).toBe(27017);
    expect(testConfig.databaseConfig.user).toBe("");
    expect(testConfig.databaseConfig.password).toBe("");
    expect(testConfig.databaseConfig.timeout).toBe(15_000);
    expect(testConfig.scraperConfig).not.toBe(null);
    expect(testConfig.scraperConfig.loginInterval).toBe(30);
    expect(testConfig.scraperConfig.scrapInterval).toBe(30_000);
    expect(testConfig.scraperConfig.defaultTimeout).toBe(15_000);
    expect(testConfig.scraperConfig.timeoutAttempts).toBe(10);
  });
  test("returns correct result using environment variables", () => {
    process.env.SERVER_PORT = 1234;
    const testConfig = new AppConfig().getConfig();
    expect(testConfig.serverConfig).not.toBe(null);
    expect(testConfig.serverConfig.port).toBe(1234);
  });
});

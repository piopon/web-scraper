import { AppConfig } from "../../src/config/app-config.js";
import { DemoMode } from "../../src/config/app-types.js";
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
    expect(testConfig.usersDataConfig.upload).toMatch("web-scraper" + path.sep + "upload");
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
    expect(testConfig.authConfig).not.toBe(null);
    expect(testConfig.authConfig.demoMode).toStrictEqual(DemoMode.DUPLICATE);
    expect(testConfig.authConfig.hashSalt).toBe(10);
    expect(testConfig.scraperConfig).not.toBe(null);
    expect(testConfig.scraperConfig.loginInterval).toBe(30);
    expect(testConfig.scraperConfig.scrapInterval).toBe(30_000);
    expect(testConfig.scraperConfig.defaultTimeout).toBe(15_000);
    expect(testConfig.scraperConfig.timeoutAttempts).toBe(10);
    expect(testConfig.scraperConfig.browser).not.toBe(null);
    expect(testConfig.scraperConfig.browser.useEmbedded).toBe(false);
    expect(testConfig.scraperConfig.browser.useSandbox).toBe(true);
    expect(testConfig.scraperConfig.browser.profileDir).toBe("_puppeteer-profile");
  });
  describe("returns correct result using environment variables", () => {
    test("for server config", () => {
      process.env.SERVER_PORT = 1234;
      const testConfig = new AppConfig().getConfig();
      expect(testConfig.serverConfig).not.toBe(null);
      expect(testConfig.serverConfig.port).toBe(1234);
    });
    test("for database config", () => {
      process.env.DB_ADDRESS = "test-custom-url";
      process.env.DB_NAME = "test-name";
      process.env.DB_PORT = 4321;
      process.env.DB_USER = "test-user";
      process.env.DB_PASSWORD = "test-password";
      process.env.DB_TIMEOUT = 66_123;
      const testConfig = new AppConfig().getConfig();
      expect(testConfig.databaseConfig).not.toBe(null);
      expect(testConfig.databaseConfig.url).toBe("test-custom-url");
      expect(testConfig.databaseConfig.name).toBe("test-name");
      expect(testConfig.databaseConfig.port).toBe(4321);
      expect(testConfig.databaseConfig.user).toBe("test-user");
      expect(testConfig.databaseConfig.password).toBe("test-password");
      expect(testConfig.databaseConfig.timeout).toBe(66_123);
    });
    test("for auth config", () => {
      process.env.DEMO_MODE = "overwrite";
      process.env.ENCRYPT_SALT = 123;
      const testConfig = new AppConfig().getConfig();
      expect(testConfig.authConfig).not.toBe(null);
      expect(testConfig.authConfig.demoMode).toStrictEqual(DemoMode.OVERWRITE);
      expect(testConfig.authConfig.hashSalt).toBe(123);
    });
    test("for scraper config", () => {
      process.env.SCRAP_INACTIVE_DAYS = 365;
      process.env.SCRAP_INTERVAL_SEC = 37;
      const testConfig = new AppConfig().getConfig();
      expect(testConfig.scraperConfig).not.toBe(null);
      expect(testConfig.scraperConfig.loginInterval).toBe(365);
      expect(testConfig.scraperConfig.scrapInterval).toBe(37_000);
      expect(testConfig.scraperConfig.defaultTimeout).toBe(15_000);
      expect(testConfig.scraperConfig.timeoutAttempts).toBe(10);
    });
    test("for scraper browser config", () => {
      process.env.SCRAP_BROWSER_PROFILE = "/test/path/to/chrome/profile";
      process.env.SCRAP_BROWSER_SANDBOX = false;
      process.env.SCRAP_BROWSER_EMBEDDED = true;
      const testConfig = new AppConfig().getConfig();
      expect(testConfig.scraperConfig.browser).not.toBe(null);
      expect(testConfig.scraperConfig.browser.useEmbedded).toBe(true);
      expect(testConfig.scraperConfig.browser.useSandbox).toBe(false);
      expect(testConfig.scraperConfig.browser.profileDir).toBe("/test/path/to/chrome/profile");
    });
  });
});

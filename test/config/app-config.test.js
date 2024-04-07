import { AppConfig } from "../../config/app-config.js";
import { LogLevel } from "../../config/app-types.js";

describe("getConfig", () => {
  test("returns correct result", () => {
    const testConfig = new AppConfig().getConfig();
    expect(testConfig.usersDataPath).toMatch(/web-scraper\\users/);
    expect(testConfig.minLogLevel).toBe(LogLevel.INFO);
    expect(testConfig.serverConfig).not.toBe(null);
    expect(testConfig.serverConfig.port).toBe("5000");
    expect(testConfig.databaseConfig).not.toBe(null);
    expect(testConfig.databaseConfig.url).toBe("localhost");
    expect(testConfig.databaseConfig.name).toBe("web-scraper");
    expect(testConfig.databaseConfig.port).toBe("27017");
    expect(testConfig.databaseConfig.user).toBe("");
    expect(testConfig.databaseConfig.password).toBe("");
    expect(testConfig.databaseConfig.timeout).toBe(15_000);
    expect(testConfig.scraperConfig).not.toBe(null);
  });
});

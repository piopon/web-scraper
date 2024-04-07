import { AppConfig } from "../../config/app-config.js";
import { LogLevel } from "../../config/app-types.js";

describe("getConfig", () => {
  test("returns correct result", () => {
    const testConfig = new AppConfig().getConfig();
    expect(testConfig.usersDataPath).toMatch(/web-scraper\\users/);
    expect(testConfig.minLogLevel).toBe(LogLevel.INFO);
    expect(testConfig.serverConfig).not.toBe(null);
    expect(testConfig.databaseConfig).not.toBe(null);
    expect(testConfig.scraperConfig).not.toBe(null);
  });
});

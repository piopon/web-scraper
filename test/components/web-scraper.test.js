import { WebScraper } from "../../src/components/web-scraper.js";
import { LogLevel } from "../../config/app-types.js";

test("getName() returns correct result", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO });
  expect(testScraper.getName()).toBe("web-scraper   ");
});

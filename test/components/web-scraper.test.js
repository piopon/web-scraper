import { WebScraper } from "../../src/components/web-scraper.js";
import { ComponentType, LogLevel } from "../../config/app-types.js";

test("getName() returns correct result", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO });
  expect(testScraper.getName()).toBe("web-scraper   ");
});

test("getInfo() returns correct result", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO });
  const infoObject = testScraper.getInfo();
  expect(infoObject).not.toBe(undefined);
  expect(infoObject.types).toStrictEqual([ComponentType.SLAVE, ComponentType.CONFIG, ComponentType.AUTH]);
  expect(infoObject.initWait).toBe(false);
});
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

test("getMaster() returns correct result", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO });
  const masterObject = testScraper.getMaster();
  expect(masterObject).not.toBe(undefined);
  expect(masterObject.name).toBe("web-database");
  expect(masterObject.actions).not.toBe(undefined);
  expect(masterObject.actions.afterInit).not.toBe(undefined);
});

describe("start() method", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO });
  test("fails when no session user is provided", async () => {
    const result = await testScraper.start();
    expect(result).toBe(false);
  });
  test("fails when session user has invalid type", async () => {
    const result = await testScraper.start("user");
    expect(result).toBe(false);
  });
  test("fails when session user has no name property", async () => {
    const result = await testScraper.start({ email: "mail", config: { prop: "value" } });
    expect(result).toBe(false);
  });
  test("fails when session user has no email property", async () => {
    const result = await testScraper.start({ email: "mail", config: { prop: "value" } });
    expect(result).toBe(false);
  });
  test("fails when session user has no config property", async () => {
    const result = await testScraper.start({ name: "test", email: "mail" });
    expect(result).toBe(false);
  });
  test("fails when specified user configuration is invalid", async () => {
    const result = await testScraper.start({ name: "test", email: "mail", config: { user: "ID" } });
    expect(result).toBe(false);
  });
});

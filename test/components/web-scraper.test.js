import { WebScraper } from "../../src/components/web-scraper.js";
import { ComponentStatus, ComponentType, LogLevel } from "../../config/app-types.js";
import { ScrapConfig } from "../../src/model/scrap-config.js";

import { jest } from "@jest/globals";

jest.mock("../../src/model/scrap-config.js");

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
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO, scraperConfig: { defaultTimeout: 10 } });
  test("fails when no session user is provided", async () => {
    const result = await testScraper.start();
    expect(result).toBe(false);
  });
  test("fails when session user has invalid type", async () => {
    const result = await testScraper.start("user");
    expect(result).toBe(false);
  });
  test("fails when session user has no name property", async () => {
    const userConfig = { user: "ID", groups: [] };
    const result = await testScraper.start({ email: "mail", config: userConfig });
    expect(result).toBe(false);
  });
  test("fails when session user has no email property", async () => {
    const userConfig = { user: "ID", groups: [] };
    const result = await testScraper.start({ email: "mail", config: userConfig });
    expect(result).toBe(false);
  });
  test("fails when session user has no config property", async () => {
    const result = await testScraper.start({ name: "test", email: "mail" });
    expect(result).toBe(false);
  });
  test("fails when specified user configuration is invalid", async () => {
    const userConfig = { user: "ID", groups: [] };
    const result = await testScraper.start({ name: "test", email: "mail", config: userConfig });
    expect(result).toBe(false);
  });
  test("fails when specified user configuration is missing", async () => {
    const userConfig = { user: "ID", groups: [] };
    const mockResult = null;
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    const result = await testScraper.start({ name: "test", email: "mail", config: userConfig });
    expect(result).toBe(false);
  });
  test("succeeds when specified user configuration is found", async () => {
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          domain: "www.google.com",
          observers: {
            name: "logo",
            path: "info",
            price: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
          },
        },
      ],
    };
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    const result = await testScraper.start({ name: "test", email: "mail", config: userConfig });
    expect(result).toBe(true);
    await testScraper.stop("mail");
  });
});

describe("stop() method", () => {
  const userConfig = {
    user: "ID",
    groups: [
      {
        name: "test",
        domain: "www.google.com",
        observers: {
          name: "logo",
          path: "info",
          price: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
        },
      },
    ],
  };
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO, scraperConfig: { defaultTimeout: 10 } });
  test("does not do anything when session was not started", async () => {
    await testScraper.stop();
    const result = testScraper.getHistory({ name: "test", email: "mail" });
    expect(result.length).toBe(2);
    expect(result[1].type).toBe("error");
    expect(result[1].message).toBe("Invalid internal state: session not started");
  });
  test("does correctly stop session with info message", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start({ name: "test", email: "mail", config: userConfig });
    await testScraper.stop("mail");
    const result = testScraper.getHistory({ name: "test", email: "mail" });
    expect(result[result.length - 1].type).toBe("info");
    expect(result[result.length - 1].message).toBe("Stopped");
  });
  test("does correctly stop session with error message", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start({ name: "test", email: "mail", config: userConfig });
    await testScraper.stop("mail", "Error message");
    const result = testScraper.getHistory({ name: "test", email: "mail" });
    expect(result[result.length - 1].type).toBe("error");
    expect(result[result.length - 1].message).toBe("Error message");
  });
});

describe("getHistory() returns correct result", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO, scraperConfig: { defaultTimeout: 10 } });
  test("after creating object", async () => {
    const result = testScraper.getHistory({ name: "test", email: "mail" });
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("info");
    expect(result[0].message).toBe("Created");
  });
});

describe("getStatus() returns correct result", () => {
  const userConfig = {
    user: "ID",
    groups: [
      {
        name: "test",
        domain: "www.google.com",
        observers: {
          name: "logo",
          path: "info",
          price: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
        },
      },
    ],
  };
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO, scraperConfig: { defaultTimeout: 10 } });
  test("when session is not provided nor started then STOPPED", async () => {
    expect(testScraper.getStatus()).toBe(ComponentStatus.STOPPED);
  });
  test("when session is not provided but started then RUNNING", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start({ name: "test", email: "mail", config: userConfig });
    expect(testScraper.getStatus()).toBe(ComponentStatus.RUNNING);
    await testScraper.stop("mail");
  });
  test("when session is provided and started then RUNNING", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    const sessionUser = { name: "test", email: "mail", config: userConfig };
    await testScraper.start(sessionUser);
    expect(testScraper.getStatus(sessionUser)).toBe(ComponentStatus.RUNNING);
    await testScraper.stop("mail");
  });
  test("when session is started but not existing provided then INITIALIZING", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start({ name: "test", email: "mail", config: userConfig });
    expect(testScraper.getStatus({ name: "test", email: "unknown"})).toBe(ComponentStatus.INITIALIZING);
    await testScraper.stop("mail");
  });
});

describe("update() method", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO, scraperConfig: { defaultTimeout: 10 } });
  test("returns errors when session is not existing", async () => {
    const sessionUser = { name: "test", email: "mail" };
    testScraper.update(sessionUser, {config: "name"});
    const result = testScraper.getHistory(sessionUser);
    expect(result.length).toBe(2);
    expect(result[1].type).toBe("error");
    expect(result[1].message).toBe("Invalid internal state: session not updated");
  });
  test("correctly updates internal state when session is existing", async () => {
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          domain: "www.google.com",
          observers: {
            name: "logo",
            path: "info",
            price: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
          },
        },
      ],
    };
    const sessionUser = { name: "test", email: "mail", config: userConfig };
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start(sessionUser);
    testScraper.update(sessionUser, userConfig);
    const result = testScraper.getHistory(sessionUser);
    expect(result[result.length - 1].type).not.toBe("error");
    expect(result[result.length - 1].message).not.toBe("Invalid internal state: session not updated");
    await testScraper.stop(sessionUser.email);
  });
});

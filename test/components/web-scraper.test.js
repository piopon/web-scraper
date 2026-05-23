import { WebScraper } from "../../src/components/web-scraper.js";
import { ComponentStatus, ComponentType, LogLevel } from "../../src/config/app-types.js";
import { ScrapConfig } from "../../src/model/scrap-config.js";
import { ScrapUser } from "../../src/model/scrap-user.js";

import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";
import { jest } from "@jest/globals";

jest.mock("../../src/model/scrap-config.js");

const testOwnerName = "scraper";
const testOwnerRoot = ".";
const testOwnerMail = "scraper@test.com";
const testOwnerPath = `${testOwnerRoot}/${testOwnerMail}/data.json`;

beforeAll(() => {
  createDataFile(testOwnerPath);
});

afterAll(() => {
  removeDataFile(testOwnerPath);
});

test("getName() returns correct result", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO });
  expect(testScraper.getName()).toBe("web-scraper   ");
});

test("getInfo() returns correct result", () => {
  const testScraper = new WebScraper({ minLogLevel: LogLevel.INFO });
  const infoObject = testScraper.getInfo();
  expect(infoObject).not.toBe(undefined);
  expect(infoObject.types).toStrictEqual([
    ComponentType.SLAVE,
    ComponentType.CONFIG,
    ComponentType.AUTH,
    ComponentType.LOGOUT,
  ]);
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

test("getMaster().afterInit() starts only recently active users", async () => {
  const now = new Date();
  const recent = { email: "recent@test.com", lastLogin: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
  const old = { email: "old@test.com", lastLogin: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000) };

  const testScraper = new WebScraper({
    minLogLevel: LogLevel.INFO,
    scraperConfig: {
      loginInterval: 30,
      defaultTimeout: 10,
      browser: { useEmbedded: true, profileDir: "_profile" },
    },
    usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
  });
  const startSpy = jest.spyOn(testScraper, "start").mockResolvedValue(true);
  jest.spyOn(ScrapUser, "getDatabaseModel").mockImplementation(() => ({
    find: async () => [recent, old],
  }));

  await testScraper.getMaster().actions.afterInit();

  expect(startSpy).toHaveBeenCalledTimes(1);
  expect(startSpy).toHaveBeenCalledWith(recent);
});

describe("start() method", () => {
  const testScraper = new WebScraper({
    minLogLevel: LogLevel.INFO,
    scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: true, profileDir: "_profile" } },
    usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
  });
  test("fails when external browser cannot be found", async () => {
    const result = await new WebScraper({
      minLogLevel: LogLevel.INFO,
      scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: false } },
    }).start();
    expect(result).toBe(false);
  }, 15_000);
  test("fails when no session user is provided", async () => {
    const result = await testScraper.start();
    expect(result).toBe(false);
  }, 15_000);
  test("fails when session user has invalid type", async () => {
    const result = await testScraper.start("user");
    expect(result).toBe(false);
  }, 15_000);
  test("fails when session user has no name property", async () => {
    const userConfig = { user: "ID", groups: [] };
    const result = await testScraper.start({ email: testOwnerMail, config: userConfig });
    expect(result).toBe(false);
  }, 15_000);
  test("fails when session user has no email property", async () => {
    const userConfig = { user: "ID", groups: [] };
    const result = await testScraper.start({ email: testOwnerMail, config: userConfig });
    expect(result).toBe(false);
  }, 10_000);
  test("fails when session user has no config property", async () => {
    const result = await testScraper.start({ name: testOwnerName, email: testOwnerMail });
    expect(result).toBe(false);
  }, 15_000);
  test("fails when specified user configuration is invalid", async () => {
    const userConfig = { user: "ID", groups: [] };
    const result = await testScraper.start({ name: testOwnerName, email: testOwnerMail, config: userConfig });
    expect(result).toBe(false);
  }, 15_000);
  test("fails when specified user configuration is missing", async () => {
    const userConfig = { user: "ID", groups: [] };
    const mockResult = null;
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    const result = await testScraper.start({ name: testOwnerName, email: testOwnerMail, config: userConfig });
    expect(result).toBe(false);
  }, 15_000);

  test("fails when configuration document is not found by id", async () => {
    const userConfig = { user: "ID", groups: [] };
    const mockResult = { findById: async () => null };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    const result = await testScraper.start({ name: testOwnerName, email: testOwnerMail, config: userConfig });

    expect(result).toBe(false);
  }, 15_000);

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
            data: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
          },
        },
      ],
    };
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    const result = await testScraper.start({ name: testOwnerName, email: testOwnerMail, config: userConfig });
    expect(result).toBe(true);
    await testScraper.stop(testOwnerMail);
  }, 15_000);

  test("returns early when session for user is already initialized", async () => {
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          domain: "www.google.com",
          observers: {
            name: "logo",
            path: "info",
            data: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
          },
        },
      ],
    };
    const sessionUser = { name: testOwnerName, email: testOwnerMail, config: userConfig };
    const localScraper = new WebScraper({
      minLogLevel: LogLevel.DEBUG,
      scraperConfig: { scrapInterval: 60_000, defaultTimeout: 10, browser: { useEmbedded: true, profileDir: "_profile" } },
      usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
    });
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    const firstResult = await localScraper.start(sessionUser);
    const secondResult = await localScraper.start(sessionUser);

    expect(firstResult).toBe(true);
    expect(secondResult).toBe(undefined);
    await localScraper.stop(sessionUser.email);
  }, 15_000);
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
          data: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
        },
      },
    ],
  };
  const sessionUser = { name: testOwnerName, email: testOwnerMail, config: userConfig };
  const testScraper = new WebScraper({
    minLogLevel: LogLevel.INFO,
    scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: true, profileDir: "_profile" } },
    usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
  });
  test("does not do anything when session was not started", async () => {
    await testScraper.stop();
    const result = testScraper.getHistory(sessionUser);
    expect(result.length).toBe(2);
    expect(result[1].type).toBe("error");
    expect(result[1].message).toBe("Invalid internal state: session not started");
  }, 15_000);
  test("does correctly stop session with info message", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start(sessionUser);
    await testScraper.stop(sessionUser.email);
    const result = testScraper.getHistory(sessionUser);
    expect(result[result.length - 1].type).toBe("info");
    expect(result[result.length - 1].message).toBe(`${testOwnerMail}: Stopped.`);
  }, 15_000);
  test("does correctly stop session with error message", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start(sessionUser);
    await testScraper.stop(sessionUser.email, "Error message");
    const result = testScraper.getHistory(sessionUser);
    expect(result[result.length - 1].type).toBe("info");
    expect(result[result.length - 1].message).toBe(`${testOwnerMail}: Error message`);
  }, 15_000);

  test("logs warning when page close throws during stop", async () => {
    const pageCloseError = new Error("close failed");
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      close: jest.fn(async () => {
        throw pageCloseError;
      }),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    await testScraper.start(sessionUser);
    await testScraper.stop(sessionUser.email);

    const result = testScraper.getHistory(sessionUser);
    expect(result[result.length - 1].type).toBe("warning");
    expect(result[result.length - 1].message).toBe(`Stop issue: ${pageCloseError.message}`);
    launchSpy.mockRestore();
  }, 15_000);
});

describe("getHistory() returns correct result", () => {
  const sessionUser = { name: testOwnerName, email: testOwnerMail };
  const testScraper = new WebScraper({
    minLogLevel: LogLevel.INFO,
    scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: true, profileDir: "_profile" } },
    usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
  });
  test("after creating object", async () => {
    const result = testScraper.getHistory(sessionUser);
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("info");
    expect(result[0].message).toBe("Created");
  });

  test("without session user returns global history", () => {
    const result = testScraper.getHistory();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].type).toBe("info");
    expect(result[0].message).toBe("Created");
  });

  test("stops running session when current status is error", async () => {
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          domain: "www.google.com",
          observers: {
            name: "logo",
            path: "info",
            data: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
          },
        },
      ],
    };
    const sessionUser = { name: testOwnerName, email: testOwnerMail, config: userConfig };
    const localScraper = new WebScraper({
      minLogLevel: LogLevel.INFO,
      scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: true, profileDir: "_profile" } },
      usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
    });
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    await localScraper.start(sessionUser);
    localScraper.update({ name: "other", email: "other@test.com" }, { config: "value" });

    const stopSpy = jest.spyOn(localScraper, "stop").mockResolvedValueOnce(true);
    localScraper.getHistory(sessionUser);

    expect(stopSpy).toHaveBeenCalledWith(sessionUser.email, "Invalid internal state");
    stopSpy.mockRestore();
    await localScraper.stop(sessionUser.email);
  }, 15_000);
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
          data: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
        },
      },
    ],
  };
  const sessionUser = { name: testOwnerName, email: testOwnerMail, config: userConfig };
  const testScraper = new WebScraper({
    minLogLevel: LogLevel.INFO,
    scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: true, profileDir: "_profile" } },
    usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
  });
  test("when session is not provided nor started then STOPPED", async () => {
    expect(testScraper.getStatus()).toBe(ComponentStatus.STOPPED);
  });
  test("when session is not provided but started then RUNNING", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start(sessionUser);
    expect(testScraper.getStatus()).toBe(ComponentStatus.RUNNING);
    await testScraper.stop(sessionUser.email);
  });
  test("when session is provided and started then RUNNING", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start(sessionUser);
    expect(testScraper.getStatus(sessionUser)).toBe(ComponentStatus.RUNNING);
    await testScraper.stop(sessionUser.email);
  });
  test("when session is started but not existing provided then INITIALIZING", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start(sessionUser);
    expect(testScraper.getStatus({ email: "unknown" })).toBe(ComponentStatus.INITIALIZING);
    await testScraper.stop(sessionUser.email);
  });
});

describe("update() method", () => {
  const testScraper = new WebScraper({
    minLogLevel: LogLevel.INFO,
    scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: true, profileDir: "_profile" } },
    usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
  });
  test("returns errors when session is not existing", async () => {
    const sessionUser = { name: testOwnerName, email: testOwnerMail };
    testScraper.update(sessionUser, { config: "name" });
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
            data: { selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
          },
        },
      ],
    };
    const sessionUser = { name: testOwnerName, email: testOwnerMail, config: userConfig };
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    await testScraper.start(sessionUser);
    testScraper.update(sessionUser, userConfig);
    const result = testScraper.getHistory(sessionUser);
    expect(result[result.length - 1].type).not.toBe("error");
    expect(result[result.length - 1].message).not.toBe("Invalid internal state: session not updated");
    await testScraper.stop(sessionUser.email);
  });

  test("does not log update error when missing session belongs to DEMO_BASE", async () => {
    const testScraper = new WebScraper({
      minLogLevel: LogLevel.INFO,
      scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: true, profileDir: "_profile" } },
      usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
    });
    const originalDemoBase = process.env.DEMO_BASE;
    const demoEmail = "demo-base@test.com";
    try {
      process.env.DEMO_BASE = demoEmail;

      testScraper.update({ name: "demo", email: demoEmail }, { config: "value" });
      const result = testScraper.getHistory({ email: demoEmail });

      expect(result.length).toBe(1);
      expect(result[0].type).toBe("info");
      expect(result[0].message).toBe("Created");
    } finally {
      process.env.DEMO_BASE = originalDemoBase;
    }
  });
});

describe("clean() method", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns true when user directory does not exist", async () => {
    const testScraper = new WebScraper({
      minLogLevel: LogLevel.INFO,
      scraperConfig: { cleanErrorWait: 0, browser: { useEmbedded: true, profileDir: "_profile" } },
      usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
    });
    const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(false);

    const result = await testScraper.clean("missing@test.com");

    expect(result).toBe(true);
    expect(existsSpy).toHaveBeenCalled();
  });

  test("retries on transient delete error and finally returns true", async () => {
    const testScraper = new WebScraper({
      minLogLevel: LogLevel.INFO,
      scraperConfig: { cleanErrorWait: 0, browser: { useEmbedded: true, profileDir: "_profile" } },
      usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
    });
    const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(true);
    const rmSpy = jest
      .spyOn(fs.promises, "rm")
      .mockRejectedValueOnce(new Error("EBUSY: resource busy"))
      .mockResolvedValueOnce();

    const result = await testScraper.clean("retry@test.com");

    expect(result).toBe(true);
    expect(existsSpy).toHaveBeenCalled();
    expect(rmSpy).toHaveBeenCalledTimes(2);
  });

  test("returns false when delete fails for all retry attempts", async () => {
    const testScraper = new WebScraper({
      minLogLevel: LogLevel.INFO,
      scraperConfig: { cleanErrorWait: 0, browser: { useEmbedded: true, profileDir: "_profile" } },
      usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
    });
    const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(true);
    const rmSpy = jest.spyOn(fs.promises, "rm").mockRejectedValue(new Error("EACCES: permission denied"));

    const result = await testScraper.clean("failed@test.com");

    expect(result).toBe(false);
    expect(existsSpy).toHaveBeenCalled();
    expect(rmSpy).toHaveBeenCalledTimes(3);
  });
});

function createDataFile(filePath) {
  try {
    // create parent directory (if needed)
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    // create the test data file
    fs.writeFileSync(filePath, JSON.stringify({ dummy: "content" }));
  } catch (err) {
    console.error(`Could not create data file: ${err}`);
  }
}

function removeDataFile(filePath) {
  // remove the test data file
  fs.rmSync(filePath, { force: true });
  // remove parent directory (if present)
  const fileDir = path.dirname(filePath);
  if (fileDir !== testOwnerRoot) {
    fs.rmSync(fileDir, {maxRetries: 10, retryDelay: 500, recursive: true, force: true});
  }
}

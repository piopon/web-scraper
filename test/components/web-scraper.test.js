import { WebScraper } from "../../src/components/web-scraper.js";
import { ComponentStatus, ComponentType, LogLevel } from "../../src/config/app-types.js";
import { ScrapConfig } from "../../src/model/scrap-config.js";
import { ScrapWarning } from "../../src/model/scrap-exception.js";
import { ScrapUser } from "../../src/model/scrap-user.js";
import { ScrapValidator } from "../../src/model/scrap-validator.js";

import path from "path";
import fs from "fs";
import puppeteer, { TimeoutError } from "puppeteer";
import { jest } from "@jest/globals";

jest.mock("../../src/model/scrap-config.js");

const testOwnerName = "scraper";
const testOwnerRoot = ".";
const testOwnerMail = "scraper@test.com";
const testOwnerPath = `${testOwnerRoot}/${testOwnerMail}/data.json`;
let isolationCounter = 0;
const isolatedTestEmails = new Set();

beforeAll(() => {
  cleanupIsolatedScraperDataDirs();
  createDataFile(testOwnerPath);
});

afterAll(() => {
  removeDataFile(testOwnerPath);
  cleanupIsolatedScraperDataDirs();
});

afterEach(() => {
  // Keep cross-test state isolated before adding deeper scraper-branch tests.
  jest.restoreAllMocks();
  cleanupIsolatedScraperDataDirs();
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
    jest.resetModules();
    jest.unstable_mockModule("locate-chrome", () => ({ default: async () => "" }));
    const { WebScraper: IsolatedWebScraper } = await import("../../src/components/web-scraper.js");
    const result = await new IsolatedWebScraper({
      minLogLevel: LogLevel.INFO,
      scraperConfig: { defaultTimeout: 10, browser: { useEmbedded: false } },
      usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
    }).start();
    expect(result).toBe(false);
  }, 15_000);
  test("fails when no session user is provided", async () => {
    const isolated = createIsolatedScraperTestContext();
    const result = await isolated.scraper.start();
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

  test("does not duplicate stop info when reason equals current status message", async () => {
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    await testScraper.start(sessionUser);
    const historyBeforeStop = testScraper.getHistory(sessionUser);
    const previousStatusMessage = historyBeforeStop[historyBeforeStop.length - 1].message;

    await testScraper.stop(sessionUser.email, previousStatusMessage);

    const historyAfterStop = testScraper.getHistory(sessionUser);
    expect(historyAfterStop[historyAfterStop.length - 1].message).toBe(previousStatusMessage);
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

  test("logs invalid state when session id is null but status reports running", async () => {
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "www.google.com",
          observers: [
            {
              name: "logo",
              path: "info",
              target: "load",
              history: "off",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "logo" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "-" },
            },
          ],
        },
      ],
    };
    const isolated = createIsolatedScraperTestContext();
    const sessionUser = { name: testOwnerName, email: isolated.email, config: userConfig };
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation(() => null);
    const mockResult = { findById: () => ({ toJSON: () => userConfig }) };
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);

      const history = isolated.scraper.getHistory(sessionUser);
      expect(history[history.length - 1].type).toBe("error");
      expect(history[history.length - 1].message).toBe("Invalid internal state");
    } finally {
      setIntervalSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
    }
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

describe("scrap iteration flow", () => {
  test("runs one scrape iteration and saves formatted data", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async () => ({ status: "OK", name: "Item", icon: "icon.png", data: "123 PLN", extra: "PLN" })),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 777;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].name).toBe("test");
      expect(savedData[0].items[0].status).toBe("OK");
      expect(savedData[0].items[0].data).toBe("123");
    } finally {
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("runs one scrape iteration using in-page evaluator callback", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const originalDocument = global.document;
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async (evaluateFn, observer) => {
        const dataContainer = {
          querySelector: (selector) => {
            if (selector === observer.title.selector) {
              return { innerText: "Item" };
            }
            if (selector === observer.image.selector) {
              return { src: "icon.png" };
            }
            if (selector === observer.data.selector) {
              return { innerHTML: "123 PLN" };
            }
            return null;
          },
        };
        global.document = {
          querySelector: (selector) => (selector === observer.container ? dataContainer : null),
        };
        try {
          return evaluateFn(observer);
        } finally {
          global.document = originalDocument;
        }
      }),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 783;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("OK");
      expect(savedData[0].items[0].name).toBe("Item");
      expect(savedData[0].items[0].icon).toBe("icon.png");
      expect(savedData[0].items[0].data).toBe("123");
    } finally {
      global.document = originalDocument;
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("marks observer as error when data container is missing", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const originalDocument = global.document;
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async (evaluateFn, observer) => {
        global.document = {
          querySelector: () => null,
        };
        try {
          return evaluateFn(observer);
        } finally {
          global.document = originalDocument;
        }
      }),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 784;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("ERROR");
      expect(savedData[0].items[0].reason).toBe("Incorrect scrap configuration: Cannot find data container");
    } finally {
      global.document = originalDocument;
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("marks observer as error when required element is missing", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const originalDocument = global.document;
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async (evaluateFn, observer) => {
        const dataContainer = {
          querySelector: () => null,
        };
        global.document = {
          querySelector: (selector) => (selector === observer.container ? dataContainer : null),
        };
        try {
          return evaluateFn(observer);
        } finally {
          global.document = originalDocument;
        }
      }),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 785;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("ERROR");
      expect(savedData[0].items[0].reason).toBe("Incorrect scrap configuration: Cannot find title element of /");
    } finally {
      global.document = originalDocument;
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("marks observer as error when required element value is missing", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const originalDocument = global.document;
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async (evaluateFn, observer) => {
        const dataContainer = {
          querySelector: (selector) => {
            if (selector === observer.title.selector) {
              return {};
            }
            if (selector === observer.image.selector) {
              return { src: "icon.png" };
            }
            if (selector === observer.data.selector) {
              return { innerHTML: "123 PLN" };
            }
            return null;
          },
        };
        global.document = {
          querySelector: (selector) => (selector === observer.container ? dataContainer : null),
        };
        try {
          return evaluateFn(observer);
        } finally {
          global.document = originalDocument;
        }
      }),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 786;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("ERROR");
      expect(savedData[0].items[0].reason).toBe("Incorrect scrap configuration: Cannot find title value of /");
    } finally {
      global.document = originalDocument;
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("uses auxiliary values when selector or attribute is missing", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "", attribute: "", auxiliary: "fallback-title" },
              image: { interval: "1m", selector: "", attribute: "", auxiliary: "fallback-icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const originalDocument = global.document;
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async (evaluateFn, observer) => {
        const dataContainer = {
          querySelector: (selector) => {
            if (selector === observer.data.selector) {
              return { innerHTML: "123 PLN" };
            }
            return null;
          },
        };
        global.document = {
          querySelector: (selector) => (selector === observer.container ? dataContainer : null),
        };
        try {
          return evaluateFn(observer);
        } finally {
          global.document = originalDocument;
        }
      }),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 787;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("OK");
      expect(savedData[0].items[0].name).toBe("fallback-title");
      expect(savedData[0].items[0].icon).toBe("fallback-icon");
      expect(savedData[0].items[0].data).toBe("123");
    } finally {
      global.document = originalDocument;
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("stops iteration safely when updated config has invalid shape", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async () => ({ status: "OK", name: "Item", icon: "icon.png", data: "123 PLN", extra: "PLN" })),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 788;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      isolated.scraper.update(sessionUser, { user: "ID" });
      const iterationResult = await intervalCallback();

      expect(iterationResult).toBe(false);
      const history = isolated.scraper.getHistory({ email: isolated.email });
      expect(
        history.some(
          (entry) => entry.type === "error" && entry.message === "Invalid internal state: Missing scrap configuration"
        )
      ).toBe(true);
    } finally {
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("stops iteration when startup warning keeps malformed config reference", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              data: { auxiliary: "PLN" },
            },
          ],
        },
      ],
    };
    const configCandidate = {
      ...userConfig,
      toJSON: () => userConfig,
    };
    const mockResult = { findById: async () => configCandidate };
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async () => ({ status: "OK", name: "Item", icon: "icon.png", data: "123 PLN", extra: "PLN" })),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 789;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);
    jest.spyOn(ScrapValidator.prototype, "validate").mockImplementationOnce(() => {
      throw new ScrapWarning("forced warning for test");
    });

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      configCandidate.groups = undefined;
      const iterationResult = await intervalCallback();

      expect(iterationResult).toBe(false);
      const history = isolated.scraper.getHistory({ email: isolated.email });
      expect(
        history.some(
          (entry) => entry.type === "error" && entry.message === "Invalid internal state: Missing scrap configuration"
        )
      ).toBe(true);
    } finally {
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("applies updated config before next scrape iteration", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const initialConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "old-observer",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const updatedConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "new-observer",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => initialConfig }) };
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async () => ({ err: "forced evaluate error" })),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 780;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      isolated.scraper.update(sessionUser, updatedConfig);
      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("ERROR");
      expect(savedData[0].items[0].name).toBe("new-observer");
    } finally {
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("marks observer as error after timeout retries are exhausted", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000, timeoutAttempts: 2 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "-" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => {
        throw new TimeoutError("forced timeout");
      }),
      evaluate: jest.fn(async () => ({ status: "OK", name: "Item", icon: "icon.png", data: "123 PLN", extra: "PLN" })),
      screenshot: jest.fn(async () => true),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 778;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("ERROR");
      expect(savedData[0].items[0].reason).toContain("Cannot find data element in page");

      const history = isolated.scraper.getHistory({ email: isolated.email });
      expect(history.some((entry) => entry.message.includes("Timeout when waiting for:"))).toBe(true);
      expect(history.some((entry) => entry.message.includes("Exceeded the maximum number of retries: 2"))).toBe(true);
    } finally {
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("skips iteration when previous scrape is still active", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000, timeoutAttempts: 1 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "-" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    let releaseGoto = undefined;
    const blockedGoto = new Promise((resolve) => {
      releaseGoto = resolve;
    });
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => blockedGoto),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async () => ({ status: "OK", name: "Item", icon: "icon.png", data: "123 PLN", extra: "PLN" })),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 779;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      const firstRunPromise = intervalCallback();
      await Promise.resolve();
      await intervalCallback();

      const history = isolated.scraper.getHistory({ email: isolated.email });
      expect(history.some((entry) => entry.message.includes("Skipping current scrap iteration - previous one in progress"))).toBe(
        true
      );

      releaseGoto();
      await firstRunPromise;
    } finally {
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("marks observer as error when scraped data value is missing", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async () => ({ status: "OK", name: "", icon: "icon.png", data: "", extra: "PLN" })),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 781;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("ERROR");
      expect(savedData[0].items[0].reason).toBe("Invalid scraped data: Missing data value for [unnamed]");
    } finally {
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);

  test("marks observer as error when scraped data value is ambiguous", async () => {
    const isolated = createIsolatedScraperTestContext(LogLevel.INFO, { scrapInterval: 60_000 });
    const sessionUser = { name: testOwnerName, email: isolated.email, config: "cfg-id" };
    const userConfig = {
      user: "ID",
      groups: [
        {
          name: "test",
          category: "$$$",
          domain: "https://example.com",
          observers: [
            {
              name: "logo",
              path: "/",
              target: "load",
              history: "off",
              container: "body",
              data: { interval: "1m", selector: "body p b", attribute: "innerHTML", auxiliary: "PLN" },
              title: { interval: "1m", selector: "body p", attribute: "innerText", auxiliary: "title" },
              image: { interval: "1m", selector: "img", attribute: "src", auxiliary: "icon" },
            },
          ],
        },
      ],
    };
    const mockResult = { findById: async () => ({ toJSON: () => userConfig }) };
    const pageMock = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(async () => true),
      goto: jest.fn(async () => true),
      waitForSelector: jest.fn(async () => true),
      evaluate: jest.fn(async () => ({ status: "OK", name: "Item", icon: "icon.png", data: "1 PLN 2 PLN", extra: "PLN" })),
      close: jest.fn(async () => true),
    };
    const browserMock = {
      newPage: jest.fn(async () => pageMock),
      close: jest.fn(async () => true),
    };
    let intervalCallback = undefined;
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback;
      return 782;
    });
    const launchSpy = jest.spyOn(puppeteer, "launch").mockResolvedValueOnce(browserMock);
    jest.spyOn(ScrapConfig, "getDatabaseModel").mockImplementationOnce(() => mockResult);

    try {
      const started = await isolated.scraper.start(sessionUser);
      expect(started).toBe(true);
      expect(typeof intervalCallback).toBe("function");

      await intervalCallback();

      const savedPath = path.join(testOwnerRoot, isolated.email, path.basename(testOwnerPath));
      const savedData = JSON.parse(fs.readFileSync(savedPath, "utf8"));
      expect(savedData[0].items[0].status).toBe("ERROR");
      expect(savedData[0].items[0].reason).toBe("Invalid scraped data: Incorrect data value for Item");
    } finally {
      setIntervalSpy.mockRestore();
      launchSpy.mockRestore();
      await isolated.scraper.stop(sessionUser.email);
      await isolated.scraper.clean(sessionUser.email);
    }
  }, 15_000);
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

function createIsolatedScraperTestContext(logLevel = LogLevel.INFO, scraperOverrides = {}) {
  isolationCounter += 1;
  const suffix = `${Date.now()}_${isolationCounter}`;
  const email = `scraper+${suffix}@test.com`;
  isolatedTestEmails.add(email);
  return {
    email,
    scraper: new WebScraper({
      minLogLevel: logLevel,
      scraperConfig: {
        defaultTimeout: 10,
        browser: { useEmbedded: true, profileDir: `_profile_${suffix}` },
        ...scraperOverrides,
      },
      usersDataConfig: { path: testOwnerRoot, file: path.basename(testOwnerPath) },
    }),
  };
}

function cleanupIsolatedScraperDataDirs() {
  // Remove known generated directories for this test process.
  for (const email of isolatedTestEmails) {
    const userDataDir = path.join(testOwnerRoot, email);
    if (fs.existsSync(userDataDir)) {
      fs.rmSync(userDataDir, { maxRetries: 10, retryDelay: 500, recursive: true, force: true });
    }
  }
  isolatedTestEmails.clear();

  // Also remove stale generated directories from previous interrupted runs.
  const dirPattern = /^scraper\+\d+_\d+@test\.com$/;
  for (const entry of fs.readdirSync(testOwnerRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && dirPattern.test(entry.name)) {
      const staleDir = path.join(testOwnerRoot, entry.name);
      fs.rmSync(staleDir, { maxRetries: 10, retryDelay: 500, recursive: true, force: true });
    }
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

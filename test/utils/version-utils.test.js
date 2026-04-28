import { jest } from "@jest/globals";

describe("getRuntimeVersion", () => {
  afterEach(() => {
    jest.resetModules();
  });

  test("returns package version combined with git SHA when git is available", async () => {
    const readFileSyncMock = jest.fn((filePath) => {
      if (String(filePath).endsWith("package.json")) {
        return JSON.stringify({ version: "2.4.6" });
      }
      throw new Error("Unexpected file path");
    });
    const execSyncMock = jest.fn(() => "abc1234\n");

    jest.unstable_mockModule("fs", () => ({
      default: {
        readFileSync: readFileSyncMock,
      },
    }));
    jest.unstable_mockModule("child_process", () => ({
      execSync: execSyncMock,
    }));

    const { VersionUtils } = await import("../../src/utils/version-utils.js");

    expect(VersionUtils.getRuntimeVersion()).toStrictEqual("2.4.6+abc1234");
  });

  test("returns VERSION file content when git is unavailable", async () => {
    const readFileSyncMock = jest.fn((filePath) => {
      if (String(filePath).endsWith("package.json")) {
        return JSON.stringify({ version: "2.4.6" });
      }
      if (String(filePath).endsWith("VERSION")) {
        return "1.3.0+unknown\n";
      }
      throw new Error("Unexpected file path");
    });
    const execSyncMock = jest.fn(() => {
      throw new Error("git not available");
    });

    jest.unstable_mockModule("fs", () => ({
      default: {
        readFileSync: readFileSyncMock,
      },
    }));
    jest.unstable_mockModule("child_process", () => ({
      execSync: execSyncMock,
    }));

    const { VersionUtils } = await import("../../src/utils/version-utils.js");

    expect(VersionUtils.getRuntimeVersion()).toStrictEqual("1.3.0+unknown");
  });

  test("returns package version when git and VERSION file are unavailable", async () => {
    const readFileSyncMock = jest.fn((filePath) => {
      if (String(filePath).endsWith("package.json")) {
        return JSON.stringify({ version: "2.4.6" });
      }
      if (String(filePath).endsWith("VERSION")) {
        throw new Error("VERSION not found");
      }
      throw new Error("Unexpected file path");
    });
    const execSyncMock = jest.fn(() => {
      throw new Error("git not available");
    });

    jest.unstable_mockModule("fs", () => ({
      default: {
        readFileSync: readFileSyncMock,
      },
    }));
    jest.unstable_mockModule("child_process", () => ({
      execSync: execSyncMock,
    }));

    const { VersionUtils } = await import("../../src/utils/version-utils.js");

    expect(VersionUtils.getRuntimeVersion()).toStrictEqual("2.4.6");
  });
});
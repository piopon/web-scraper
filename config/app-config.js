import { AppVariables } from "./app-variables.js";
import dotenv from "dotenv"
import path from "path";
import url from "url";

export class AppConfig {
  #currDir = undefined;
  #rootDir = undefined;

  /**
   * Creates a new application configuration object
   */
  constructor() {
    this.#currDir = path.dirname(url.fileURLToPath(import.meta.url));
    this.#rootDir = path.join(this.#currDir, "..");
    if (process.env.NODE_ENV !== "production") {
      dotenv.config();
    }
  }

  /**
   * Method used to receive the current application configuration
   * @returns object with application configuration
   */
  getConfig() {
    return {
      dataConfigPath: path.join(this.#rootDir, "user", "input", "scrap-config.json"),
      dataOutputPath: path.join(this.#rootDir, "user", "output", "data.json"),
      screenshotPath: path.join(this.#rootDir, "user", "captures"),
      minLogLevel: AppVariables.LOG_LEVEL_INFO,
      serverConfig: {
        port: process.env.SERVER_PORT || 5000,
      },
      scraperConfig: {
        scrapInterval: 30_000,
        defaultTimeout: 15_000,
        timeoutAttempts: 10,
      },
    };
  }
}

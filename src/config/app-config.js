import { DemoMode, LogLevel } from "./app-types.js";

import dotenv from "dotenv";
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
    this.#rootDir = path.normalize(path.join(this.#currDir, "..", ".."));
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
      jsonDataConfig: {
        path: path.join(this.#rootDir, "docs", "json"),
        config: "config.json",
        data: "data.json",
      },
      usersDataConfig: {
        upload: path.join(this.#rootDir, "upload"),
        path: path.join(this.#rootDir, "users"),
        file: "data.json",
      },
      minLogLevel: LogLevel.INFO,
      serverConfig: {
        port: parseInt(process.env.SERVER_PORT) || 5000,
      },
      databaseConfig: {
        url: process.env.DB_ADDRESS || "localhost",
        name: process.env.DB_NAME || "web-scraper",
        port: parseInt(process.env.DB_PORT) || 27017,
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
        timeout: parseInt(process.env.DB_TIMEOUT) || 15_000,
      },
      authConfig: {
        demoMode: process.env.DEMO_MODE == null ? DemoMode.DUPLICATE : new DemoMode(process.env.DEMO_MODE),
        hashSalt: parseInt(process.env.ENCRYPT_SALT) || 10,
      },
      scraperConfig: {
        loginInterval: parseInt(process.env.SCRAP_INACTIVE_DAYS) || 30,
        scrapInterval: parseInt(process.env.SCRAP_INTERVAL_SEC) * 1_000 || 30_000,
        dataExtrasType: process.env.SCRAP_EXTRAS_TYPE || "",
        defaultTimeout: 15_000,
        timeoutAttempts: 10,
        embeddedBrowser: false,
      },
    };
  }
}

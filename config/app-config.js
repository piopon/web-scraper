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
  }

  /**
   * Method used to receive the current application configuration
   * @returns object with application configuration
   */
  getConfig() {
    return {
      dataConfigPath: path.join(this.#rootDir, "user", "input", "scrap-config.json"),
      dataOutputPath: path.join(this.#rootDir, "user", "output", "data.json"),
      serverConfig: {
        port: process.env.PORT || 5000,
      },
      scraperConfig: {
        scrapInterval: 30_000,
        defaultTimeout: 25_000,
      },
    };
  }
}

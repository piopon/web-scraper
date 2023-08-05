import path from "path";
import url from "url";

export class AppConfig {
  #currDir = undefined;
  #rootDir = undefined;

  constructor() {
    this.#currDir = path.dirname(url.fileURLToPath(import.meta.url));
    this.#rootDir = path.join(this.#currDir, "..");
  }

  getConfig() {
    return {
      dataConfigPath: path.join(this.#rootDir, "user", "input", "scrap-config.json"),
      dataOutputPath: path.join(this.#rootDir, "user", "output", "data.json"),
      serverConfig: {
        port: process.env.PORT || 5000,
      },
      scraperConfig: {
        interval: 30_000,
      },
    };
  }
}

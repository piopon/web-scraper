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
      scraperConfig: {
        interval: 30_000,
        srcFile: path.join(this.#currDir, "scrap-config.json"),
        dstFile: path.join(this.#rootDir, "data", "data.json"),
      },
    };
  }
}

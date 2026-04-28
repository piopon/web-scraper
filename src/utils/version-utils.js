import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

export class VersionUtils {
  static #ROOT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

  /**
   * Method used to retrieve a runtime application version string.
   * Priority: git short SHA + package.json version, then VERSION file content.
   * @returns runtime version string in "version+sha" format
   */
  static getRuntimeVersion() {
    const appVersion = this.#readPackageVersion();
    const gitSha = this.#readGitCommitSha();
    if (gitSha) {
      return `${appVersion}+${gitSha}`;
    }

    const fileVersion = this.#readVersionFile();
    if (fileVersion) {
      return fileVersion;
    }

    return appVersion;
  }

  /**
   * Method used to synchronize VERSION file with current package.json version and git short SHA.
   * @returns synchronized version string in "version+sha" format
   */
  static syncVersionFile() {
    const appVersion = this.#readPackageVersion();
    const gitSha = this.#readGitCommitSha();
    if (!gitSha) {
      throw new Error("Unable to synchronize VERSION: git short SHA is unavailable.");
    }
    const syncedVersion = `${appVersion}+${gitSha}`;
    const versionPath = path.join(this.#ROOT_PATH, "VERSION");
    fs.writeFileSync(versionPath, `${syncedVersion}\n`, "utf8");
    return syncedVersion;
  }

  /**
   * Method used to read application semantic version from package.json file.
   * @returns package version string or "0.0.0" when unavailable
   */
  static #readPackageVersion() {
    try {
      const packagePath = path.join(this.#ROOT_PATH, "package.json");
      const packageContent = fs.readFileSync(packagePath, "utf8");
      const packageData = JSON.parse(packageContent);
      return typeof packageData.version === "string" ? packageData.version : "0.0.0";
    } catch {
      return "0.0.0";
    }
  }

  /**
   * Method used to read current short commit SHA using local git repository metadata.
   * @returns git short SHA or undefined when git metadata is unavailable
   */
  static #readGitCommitSha() {
    try {
      const commitSha = execSync("git rev-parse --short HEAD", {
        cwd: this.#ROOT_PATH,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return commitSha.trim();
    } catch {
      return undefined;
    }
  }

  /**
   * Method used to read pre-generated runtime version string from VERSION file.
   * @returns version string or undefined when file is missing or empty
   */
  static #readVersionFile() {
    try {
      const versionPath = path.join(this.#ROOT_PATH, "VERSION");
      const versionValue = fs.readFileSync(versionPath, "utf8").trim();
      return versionValue.length > 0 ? versionValue : undefined;
    } catch {
      return undefined;
    }
  }
}

import { VersionUtils } from "../src/utils/version-utils.js";

const syncedVersion = VersionUtils.syncVersionFile();
console.log(`VERSION synchronized: ${syncedVersion}`);

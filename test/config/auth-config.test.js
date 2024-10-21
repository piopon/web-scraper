import { WebComponents } from "../../src/components/web-components";
import { LogLevel } from "../../src/config/app-types";
import { AuthConfig } from "../../src/config/auth-config";

import passport from "passport";

process.env.JWT_SECRET = "test_secret";

test("configure returns correct result", () => {
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const authConfig = new AuthConfig(passport, components);
    const result = authConfig.configure();
    expect(result).not.toBe(null);
});
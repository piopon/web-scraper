import { WebComponents } from "../../src/components/web-components";
import { LogLevel } from "../../src/config/app-types";
import { AuthConfig } from "../../src/config/auth-config";

import passport from "passport";

process.env.JWT_SECRET = "test_secret";
process.env.GOOGLE_CLIENT_ID = "test_id";

test("configure returns correct result", () => {
    const components = new WebComponents({ minLogLevel: LogLevel.DEBUG });
    const authConfig = new AuthConfig(passport, components);
    const result = authConfig.configure();
    expect(Object.hasOwn(result._strategies, "jwt")).toBe(true);
    expect(Object.hasOwn(result._strategies, "google")).toBe(true);
    expect(Object.hasOwn(result._strategies, "local-login")).toBe(true);
    expect(Object.hasOwn(result._strategies, "local-register")).toBe(true);
});
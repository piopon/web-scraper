import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel } from "../../config/app-types.js";

test("getName() returns correct result", () => {
  const inConfig = { minLogLevel: LogLevel.INFO };
  const testComponent = new WebComponents(inConfig);
  expect(testComponent.getName()).toBe("web-components");
});

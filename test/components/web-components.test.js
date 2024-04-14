import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel, ComponentStatus, ComponentType } from "../../config/app-types.js";

test("getName() returns correct result", () => {
  const inConfig = { minLogLevel: LogLevel.INFO };
  const testComponent = new WebComponents(inConfig);
  expect(testComponent.getName()).toBe("web-components");
});

test("getStatus() returns correct result", () => {
  const inConfig = { minLogLevel: LogLevel.INFO };
  const testComponent = new WebComponents(inConfig);
  expect(testComponent.getStatus()).toBe(ComponentStatus.RUNNING);
});

describe("addComponent()", () => {
  test("correctly adds valid components", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent([ComponentType.CONFIG]));
    expect(testComponent.getComponents().length).toBe(1);
  });
  test("throws when input object is incorrect", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    expect(() => testComponent.addComponent(createTestComponent([ComponentType.SLAVE]))).toThrow(Error);
  });
});

function createTestComponent(types) {
  return {
    getName() {
      return "foo";
    },
    getInfo() {
      return {
        types: types,
        initWait: false,
      };
    },
    update() {},
  };
}

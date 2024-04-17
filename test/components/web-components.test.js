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
    testComponent.addComponent(createTestComponent("foo", [ComponentType.CONFIG]));
    const components = testComponent.getComponents();
    expect(components.length).toBe(1);
    expect(components[0].master).not.toBe(undefined);
    expect(components[0].slave).toBe(undefined);
  });
  test("adds component without type but prints warning", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("foo", []));
    const components = testComponent.getComponents();
    expect(components.length).toBe(1);
    expect(components[0].master).not.toBe(undefined);
    expect(components[0].slave).toBe(undefined);
    const statusHistory = testComponent.getHistory();
    expect(statusHistory.length).toBe(2);
    expect(statusHistory[0].type).toBe("info");
    expect(statusHistory[0].message).toBe("Created");
    expect(statusHistory[1].type).toBe("warning");
    expect(statusHistory[1].message).toBe("Missing component type(s): foo");
  });
  test("does add slave-only component when master IS defined", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("mas1", [ComponentType.CONFIG]));
    testComponent.addComponent(createTestComponent("foo", [ComponentType.SLAVE], "mas1"));
    const components = testComponent.getComponents();
    expect(components.length).toBe(1);
    expect(components[0].master).not.toBe(undefined);
    expect(components[0].slave).not.toBe(undefined);
  });
  test("does not add slave-only component when no component is present", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("foo", [ComponentType.SLAVE]));
    expect(testComponent.getComponents().length).toBe(0);
  });
  test("does not add slave-only component when master NOT found", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("mas1", [ComponentType.CONFIG]));
    testComponent.addComponent(createTestComponent("foo", [ComponentType.SLAVE], "master"));
    const components = testComponent.getComponents();
    expect(components.length).toBe(1);
    expect(components[0].master).not.toBe(undefined);
    expect(components[0].slave).toBe(undefined);
  });
  test("does add slave component when master not defined but other type is used", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("foo", [ComponentType.SLAVE, ComponentType.CONFIG]));
    const components = testComponent.getComponents();
    expect(components.length).toBe(1);
    expect(components[0].master).not.toBe(undefined);
    expect(components[0].slave).toBe(undefined);
  });
  test("throws when input object is incorrect", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    expect(() => testComponent.addComponent(createTestComponent("foo", [ComponentType.AUTH]))).toThrow(Error);
    expect(testComponent.getComponents().length).toBe(0);
    const statusHistory = testComponent.getHistory();
    expect(statusHistory.length).toBe(2);
    expect(statusHistory[0].type).toBe("info");
    expect(statusHistory[0].message).toBe("Created");
    expect(statusHistory[1].type).toBe("error");
    expect(statusHistory[1].message).toBe("Incompatible component: foo");
  });
});

describe("getComponents()", () => {
  test("correctly returns zero components", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    expect(testComponent.getComponents()).not.toBe(undefined);
    expect(testComponent.getComponents().length).toBe(0);
  });
  test("correctly returns all components", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("foo", [ComponentType.CONFIG]));
    testComponent.addComponent(createTestComponent("bar", [ComponentType.CONFIG]));
    testComponent.addComponent(createTestComponent("test", [ComponentType.CONFIG]));
    expect(testComponent.getComponents()).not.toBe(undefined);
    expect(testComponent.getComponents().length).toBe(3);
  });
  test("correctly returns all components with non-slave type", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("foo", [ComponentType.CONFIG]));
    testComponent.addComponent(createTestComponent("bar", [ComponentType.SLAVE]), "foo");
    testComponent.addComponent(createTestComponent("test", [ComponentType.CONFIG]));
    const configComponents = testComponent.getComponents(ComponentType.CONFIG);
    expect(configComponents).not.toBe(undefined);
    expect(configComponents.length).toBe(2);
  });
});

function createTestComponent(componentName, componentTypes, masterName = "") {
  return {
    getName() {
      return componentName;
    },
    getInfo() {
      return {
        types: componentTypes,
        initWait: false,
      };
    },
    update() {},
    getMaster() {
      return {
        name: masterName,
      };
    },
  };
}

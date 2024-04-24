import { WebComponents } from "../../src/components/web-components.js";
import { LogLevel, ComponentStatus, ComponentType } from "../../config/app-types.js";

const COMPONENT_CONFIG_PROPS = { config: { hasUpdate: true, update: () => {} } };
const COMPONENT_SLAVE_PROPS = { slave: { hasMaster: true, masterName: "master" } };

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
    testComponent.addComponent(createTestComponent2("foo", COMPONENT_CONFIG_PROPS));
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
    testComponent.addComponent(createTestComponent2("master", COMPONENT_CONFIG_PROPS));
    testComponent.addComponent(createTestComponent2("foo", COMPONENT_SLAVE_PROPS));
    const components = testComponent.getComponents();
    expect(components.length).toBe(1);
    expect(components[0].master).not.toBe(undefined);
    expect(components[0].slave).not.toBe(undefined);
  });
  test("does not add slave-only component when no component is present", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent2("foo", COMPONENT_SLAVE_PROPS));
    expect(testComponent.getComponents().length).toBe(0);
  });
  test("does not add slave-only component when master NOT found", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent2("mas1", COMPONENT_CONFIG_PROPS));
    testComponent.addComponent(createTestComponent2("foo", COMPONENT_SLAVE_PROPS));
    const components = testComponent.getComponents();
    expect(components.length).toBe(1);
    expect(components[0].master).not.toBe(undefined);
    expect(components[0].slave).toBe(undefined);
  });
  test("does add slave component when master not defined but other type is used", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent2("foo", { ...COMPONENT_SLAVE_PROPS, ...COMPONENT_CONFIG_PROPS }));
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
  test("correctly returns all components with slave type", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("foo", [ComponentType.CONFIG]));
    testComponent.addComponent(createTestComponent("bar", [ComponentType.SLAVE]), "foo");
    testComponent.addComponent(createTestComponent("test", [ComponentType.CONFIG]));
    const slaveComponents = testComponent.getComponents(ComponentType.SLAVE);
    expect(slaveComponents).not.toBe(undefined);
    expect(slaveComponents.length).toBe(0);
  });
});

describe("initComponents()", () => {
  test("will run for init component type", async () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createInitComponent("test123", true, true));
    const verifyObject = { triggeredStart: false, triggeredStop: false };
    const result = await testComponent.initComponents(ComponentType.INIT, verifyObject);
    expect(result).toBe(true);
    expect(verifyObject.triggeredStart).toBe(true);
    expect(verifyObject.triggeredStop).toBe(false);
  });
  test("will fail when init component cannot be started", async () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createInitComponent("test123", false, false));
    const verifyObject = { triggeredStart: false, triggeredStop: false };
    const result = await testComponent.initComponents(ComponentType.INIT, verifyObject);
    expect(result).toBe(false);
    expect(verifyObject.triggeredStart).toBe(true);
    expect(verifyObject.triggeredStop).toBe(false);
  });
  test("will fail for non-init component type", async () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("comp", [ComponentType.CONFIG]));
    try {
      await testComponent.initComponents(ComponentType.CONFIG);
      fail("Non existing method should throw");
    } catch (error) {
      expect(error instanceof TypeError).toBe(true);
      expect(error.message).toBe("component.master.start is not a function");
    }
  });
});

describe("runComponents()", () => {
  test("correctly invokes existing component method", async () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("comp", [ComponentType.CONFIG]));
    const verifyObject = { triggered: false };
    await testComponent.runComponents(ComponentType.CONFIG, "runTest", verifyObject);
    expect(verifyObject.triggered).toBe(true);
  });
  test("throws when trying to invoke non-existing component method", async () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("comp", [ComponentType.CONFIG]));
    const verifyObject = { triggered: false };
    try {
      await testComponent.runComponents(ComponentType.CONFIG, "notExistingMethod", verifyObject);
      fail("Non existing method should throw");
    } catch (error) {
      expect(error instanceof TypeError).toBe(true);
      expect(error.message).toBe("component.master[method] is not a function");
    }
    expect(verifyObject.triggered).toBe(false);
  });
  test("does not invoke non-existing method for not added component type", async () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("comp", [ComponentType.CONFIG]));
    const verifyObject = { triggered: false };
    await testComponent.runComponents(ComponentType.INIT, "notExistingMethod", verifyObject);
    expect(verifyObject.triggered).toBe(false);
  });
});

describe("getHistory()", () => {
  test("returns correct status after creating object", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    const statusHistory = testComponent.getHistory();
    expect(statusHistory.length).toBe(1);
    expect(statusHistory[0].type).toBe("info");
    expect(statusHistory[0].message).toBe("Created");
  });
  test("returns correct status after adding component", () => {
    const inConfig = { minLogLevel: LogLevel.INFO };
    const testComponent = new WebComponents(inConfig);
    testComponent.addComponent(createTestComponent("component1", []));
    testComponent.addComponent(createTestComponent("component2", [ComponentType.CONFIG]));
    expect(() => testComponent.addComponent(createTestComponent("component3", [ComponentType.AUTH]))).toThrow(Error);
    const statusHistory = testComponent.getHistory();
    expect(statusHistory.length).toBe(3);
    expect(statusHistory[0].type).toBe("info");
    expect(statusHistory[0].message).toBe("Created");
    expect(statusHistory[1].type).toBe("warning");
    expect(statusHistory[1].message).toBe("Missing component type(s): component1");
    expect(statusHistory[2].type).toBe("error");
    expect(statusHistory[2].message).toBe("Incompatible component: component3");
  });
});

function createTestComponent(componentName, componentTypes, masterName = "") {
  return {
    ...(true ? { getName: () => componentName } : {}),
    ...(true ? { getInfo: () => ({ types: componentTypes, initWait: false }) } : {}),
    ...(true ? { getMaster: () => ({ name: masterName }) } : {}),
    ...(true ? { runTest: (input) => (input.triggered = true) } : {}),
    ...(true ? { update: () => {} } : {}),
  };
}

function createInitComponent(componentName, startResult = true, stopResult = true) {
  return {
    getName() {
      return componentName;
    },
    getInfo() {
      return {
        types: [ComponentType.INIT],
        initWait: true,
      };
    },
    start(input) {
      input.triggeredStart = true;
      return startResult;
    },
    stop(input) {
      input.triggeredStop = true;
      return stopResult;
    },
  };
}

function createTestComponent2(name, properties) {
  const componentTypes = [];
  if (properties.auth != null) {
    componentTypes.push(ComponentType.AUTH);
  }
  if (properties.init != null) {
    componentTypes.push(ComponentType.INIT);
  }
  if (properties.slave != null) {
    componentTypes.push(ComponentType.SLAVE);
  }
  if (properties.config != null) {
    componentTypes.push(ComponentType.CONFIG);
  }
  return {
    getName: () => name,
    getInfo: () => ({ types: componentTypes, initWait: true }),
    runTest: (input) => (input.triggered = true),
    ...(properties.auth ? composeAuthComponent(properties.auth) : {}),
    ...(properties.init ? composeInitComponent(properties.init) : {}),
    ...(properties.slave ? composeSlaveComponent(properties.slave) : {}),
    ...(properties.config ? composeConfigComponent(properties.config) : {}),
  };
}

function composeConfigComponent(properties) {
  return {
    ...(properties.hasUpdate ? { update: () => properties.update() } : {}),
  };
}

function composeSlaveComponent(properties) {
  return {
    ...(properties.hasMaster ? { getMaster: () => ({ name: properties.masterName }) } : {}),
  };
}

function composeAuthComponent(properties) {
  return {
    ...(properties.hasStart ? { start: (input) => properties.start(input) } : {}),
    ...(properties.hasStop ? { stop: (input) => properties.stop(input) } : {}),
  };
}

function composeInitComponent(properties) {
  return {
    ...(properties.hasStart ? { start: (input) => properties.start(input) } : {}),
    ...(properties.hasStop ? { stop: (input) => properties.stop(input) } : {}),
  };
}

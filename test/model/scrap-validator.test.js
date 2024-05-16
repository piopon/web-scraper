import { ScrapValidator } from "../../src/model/scrap-validator.js";
import { ScrapConfig } from "../../src/model/scrap-config.js";
import { ScrapGroup } from "../../src/model/scrap-group.js";
import { ScrapObserver } from "../../src/model/scrap-observer.js";
import { ScrapComponent } from "../../src/model/scrap-component.js";
import { ScrapError, ScrapWarning } from "../../src/model/scrap-exception.js";

describe("scrap validator", () => {
  describe("throws when created with", () => {
    test("empty parameter", () => {
      expect(() => new ScrapValidator()).toThrow(ScrapError);
    });
    test("undefined parameter", () => {
      expect(() => new ScrapValidator(undefined)).toThrow(ScrapError);
    });
    test("null parameter", () => {
      expect(() => new ScrapValidator(null)).toThrow(ScrapError);
    });
  });
  test("is correctly created when input config is correct", () => {
    const inConfig = createTestConfig("OK");
    const validator = new ScrapValidator(inConfig);
    expect(validator).not.toBe(null);
  });
});

describe("validate", () => {
  test("throws error when input config has errors", () => {
    expect(() => new ScrapValidator(createTestConfig("ERR")).validate()).toThrow(ScrapError);
  });
  test("throws warning when input config has warnings", () => {
    expect(() => new ScrapValidator(createTestConfig("WARN")).validate()).toThrow(ScrapWarning);
  });
  test("returns input config when no problems found", () => {
    const inConfig = createTestConfig("OK");
    const outConfig = new ScrapValidator(inConfig).validate();
    expect(outConfig).toStrictEqual(inConfig);
  });
});

function createTestConfig(variant) {
  return new ScrapConfig({
    user: "test-user",
    groups: [
      new ScrapGroup({
        name: "test-group",
        category: "WARN" === variant ? undefined : "test-category",
        domain: "ERR" === variant ? undefined : "test-domain",
        observers: [
          new ScrapObserver({
            name: "test-observer",
            path: "test-path",
            title: createTestComponent("title"),
            image: createTestComponent("image"),
            price: createTestComponent("price"),
          }),
        ],
      }),
    ],
  });
}

function createTestComponent(type) {
  return new ScrapComponent({
    selector: `${type}-selector`,
    attribute: `${type}-selector`,
    auxiliary: `${type}-selector`,
  });
}

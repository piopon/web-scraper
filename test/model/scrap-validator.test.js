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
  test("throws single error when input config has one error", () => {
    expect(() => new ScrapValidator(createTestConfig("ERR1")).validate()).toThrow(ScrapError);
  });
  test("throws several errors when input config has multiple errors", () => {
    expect(() => new ScrapValidator(createTestConfig("ERR2")).validate()).toThrow(ScrapError);
  });
  test("throws single warning when input config has one warning", () => {
    expect(() => new ScrapValidator(createTestConfig("WARN1")).validate()).toThrow(ScrapWarning);
  });
  test("throws several warnings when input config has multiple warnings", () => {
    expect(() => new ScrapValidator(createTestConfig("WARN2")).validate()).toThrow(ScrapWarning);
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
        name: "ERR2" === variant ? "12345" : "test-group",
        category: "WARN1" === variant || "WARN2" === variant ? undefined : "test-category",
        domain: "ERR1" === variant || "ERR2" === variant ? undefined : "test-domain",
        observers: [
          new ScrapObserver({
            name: "test-observer",
            path: "test-path",
            title: "WARN2" === variant ? undefined : createTestComponent("title"),
            image: createTestComponent("image"),
            data: createTestComponent("data"),
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

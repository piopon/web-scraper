import { ScrapValidator } from "../../src/model/scrap-validator.js";
import { ScrapConfig } from "../../src/model/scrap-config.js";
import { ScrapGroup } from "../../src/model/scrap-group.js";
import { ScrapObserver } from "../../src/model/scrap-observer.js";
import { ScrapComponent } from "../../src/model/scrap-component.js";
import { ScrapError, ScrapWarning } from "../../src/model/scrap-exception.js";

describe("validate", () => {
  describe("throws when constructor", () => {
    test("has empty parameter", () => {
      expect(() => new ScrapValidator()).toThrow(ScrapError);
    });
    test("has undefined parameter", () => {
      expect(() => new ScrapValidator(undefined)).toThrow(ScrapError);
    });
    test("has null parameter", () => {
      expect(() => new ScrapValidator(null)).toThrow(ScrapError);
    });
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

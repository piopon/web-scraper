import { ScrapComponent } from "../../src/model/scrap-component.js";

describe("getIdentifier", () => {
  describe("returns correct result for component", () => {
    test("with all empty values", () => {
      const component = new ScrapComponent();
      expect(component.getIdentifier()).toBe("component = empty | empty | empty");
    });
    test("with non-empty selector", () => {
      const component = new ScrapComponent({ selector: "selector" });
      expect(component.getIdentifier()).toBe("component = selector | empty | empty");
    });
    test("with non-empty attribute", () => {
      const component = new ScrapComponent({ attribute: "attribute" });
      expect(component.getIdentifier()).toBe("component = empty | attribute | empty");
    });
    test("with non-empty auxiliary", () => {
      const component = new ScrapComponent({ auxiliary: "auxiliary" });
      expect(component.getIdentifier()).toBe("component = empty | empty | auxiliary");
    });
  });
});

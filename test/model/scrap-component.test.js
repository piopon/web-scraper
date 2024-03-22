import { ScrapComponent } from "../../src/model/scrap-component.js";

describe("getIdentifier", () => {
  describe("returns correct result for component", () => {
    test("with all empty values", () => {
      const component = new ScrapComponent();
      expect(component.getIdentifier()).toBe("component = empty | empty | empty");
    });
    test("with non-empty selector", () => {
      const component = new ScrapComponent({selector: "selector"});
      expect(component.getIdentifier()).toBe("component = selector | empty | empty");
    });
  });
});

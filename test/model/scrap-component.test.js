import { ScrapComponent } from "../../src/model/scrap-component.js";

describe("getIdentifier", () => {
  test("returns correct result for empty component", () => {
    const component = new ScrapComponent();
    expect(component.getIdentifier()).toBe("component = empty | empty | empty");
  });
});

import { ScrapUser } from "../../src/model/scrap-user.js";

describe("getDatabaseModel", () => {
  test("returns correct model names fields", () => {
    const TestModel = ScrapUser.getDatabaseModel();
    expect(TestModel.name).toBe("model");
    expect(TestModel.modelName).toBe("scraper-user");
    expect(TestModel.baseModelName).toBe(undefined);
  });
  test("can be used to create object", () => {
    const TestModel = ScrapUser.getDatabaseModel();
    expect(new TestModel({})).not.toBe(null);
  });
});

describe("getDatabaseSchema", () => {
  test("returns correct value", () => {
    const schema = ScrapUser.getDatabaseSchema();
    expect(schema).not.toBe(null);
  });
});

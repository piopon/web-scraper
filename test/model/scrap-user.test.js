import { ScrapUser } from "../../src/model/scrap-user.js";

describe("getDatabaseModel", () => {
  test("returns correct model names fields", () => {
    const TestModel = ScrapUser.getDatabaseModel();
    expect(TestModel.name).toBe("model");
    expect(TestModel.modelName).toBe("scraper-user");
    expect(TestModel.baseModelName).toBe(undefined);
  });
});

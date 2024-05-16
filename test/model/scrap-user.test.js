import { ScrapUser } from "../../src/model/scrap-user.js";

import mongoose from "mongoose";

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
  test("gets schema used for create config", () => {
    const testDate = new Date();
    const configId = new mongoose.Types.ObjectId();
    const TestModel = mongoose.model("test-config", ScrapUser.getDatabaseSchema());
    const config = new TestModel({
      unknown: "test-unknown",
      name: "test-name",
      email: "test-email",
      password: "test-password",
      lastLogin: testDate,
      config: configId,
      extra: "test-extra",
    });
    expect(config).not.toBe(null);
    expect(config.unknown).toBe(undefined);
    expect(config.name).toBe("test-name");
    expect(config.email).toBe("test-email");
    expect(config.password).toBe("test-password");
    expect(config.lastLogin).toBe(testDate);
    expect(config.config).toBe(configId);
    expect(config.extra).toBe(undefined);
  });
});

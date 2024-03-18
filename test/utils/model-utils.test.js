import { ModelUtils } from "../../src/utils/model-utils";

describe("isEmpty", () => {
    test("returns true if input object is empty", () => {
        expect(ModelUtils.isEmpty({})).toBe(true);
    });
});

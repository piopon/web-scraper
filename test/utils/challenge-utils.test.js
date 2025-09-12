import { ChallengeUtils } from "../../src/utils/challenge-utils.js";

process.env.CHALLENGE_JOIN = "+>";
process.env.CHALLENGE_PREFIX = "(:";
process.env.CHALLENGE_EOL_MINS = 10;
process.env.CHALLENGE_EOL_SEPARATOR = "@";

describe("generate", () => {
  test("returns correct string for full input object", () => {
    const inputObj = { name: "testName", mail: "testMail", address: "127.0.0.1" };
    const expected = "(:meNastte+>ilMastte+>10.0.7.12";
    expect(ChallengeUtils.generate(inputObj)).toStrictEqual(expected);
  });
});

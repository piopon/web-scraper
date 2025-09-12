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
  test("returns correct string for input object without address", () => {
    const inputObj = { name: "usrTestName", mail: "mail@test.com" };
    const expected = "(:eamtNesrTus+>mcot.es@tilma+>";
    expect(ChallengeUtils.generate(inputObj)).toStrictEqual(expected);
  });
  test("returns correct string for input object without mail", () => {
    const inputObj = { name: "diffUsr", address: "localhost" };
    const expected = "(:rUsffdi+>+>toslhcalo";
    expect(ChallengeUtils.generate(inputObj)).toStrictEqual(expected);
  });
  test("returns correct string for input object without name", () => {
    const inputObj = { mail: "usr@mail.test", address: "10.91.112.115" };
    const expected = "(:+>tes.tilmar@us+>5112.111..910";
    expect(ChallengeUtils.generate(inputObj)).toStrictEqual(expected);
  });
});

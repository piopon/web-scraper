export class ChallengeUtils {
  /**
   * Method used to generate challenge phrase
   * @param {Object} connectionData Object which values will form the challenge phrase
   * @returns String containing generated challenge phrase
   */
  static generate(connectionData) {
    const shuffled = [connectionData["name"], connectionData["mail"], connectionData["address"]]
      .map((input) => this.#shuffle(input))
      .join(process.env.CHALLENGE_JOIN);
    return process.env.CHALLENGE_PREFIX + shuffled;
  }

  /**
   * Method used to serialize challenge deadline
   * @returns deadline serialized into string
   */
  static serializeDeadline() {
    const deadline = Date.now() + process.env.CHALLENGE_EOL_MINS * 60 * 1000;
    return process.env.CHALLENGE_EOL_SEPARATOR + deadline;
  }

  /**
   * Method used to parse deadline from provided challenge string
   * @param {String} challengeString The input string containing the deadline
   * @returns challenge deadline value
   */
  static parseDeadline(challengeString) {
    const challengeParts = challengeString.split(process.env.CHALLENGE_EOL_SEPARATOR);
    if (challengeParts.length !== 2) {
      throw Error("Provided string does not contain challenge");
    }
    return parseInt(challengeParts[1]);
  }

  /**
   * Method used to shuffle input string
   * @param {String} input The string which contents we want to shuffle
   * @returns shuffled string
   */
  static #shuffle(input) {
    let chars = input.split("");
    for (let i = 0; i < chars.length - 1; i += 2) {
      [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    }
    return chars.reverse().join("");
  }
}

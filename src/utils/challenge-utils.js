export class ChallengeUtils {
  /**
   * Method used to generate challenge phrase
   * @param {Object} connectionData Object which values will form the challenge phrase
   * @returns String containing generated challenge phrase
   */
  static generate(connectionData) {
    const shuffled = Object.values(connectionData)
      .map((input) => this.#shuffle(input))
      .join(process.env.CHALLENGE_JOIN);
    return process.env.CHALLENGE_PREFIX + shuffled;
  }

  /**
   * Method used to compare reference phrase with the one generated with current data
   * @param {String} referenceData The reference challenge phrase
   * @param {Object} currentData The data to generate current challenge phrase
   * @returns true if reference phrase is equal to current one, false otherwise
   */
  static compare(referenceData, currentData) {
    return referenceData === generate(currentData);
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

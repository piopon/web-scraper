export class ChallengeUtils {
  /**
   * Method used to generate challenge phrase
   * @param {Array} inputs Array of inputs which form challenge
   * @returns String containing generated challenge phrase
   */
  static generate(...inputs) {
    const shuffled = inputs.map((input) => this.#shuffle(input)).join(process.env.CHALLENGE_JOIN);
    return process.env.CHALLENGE_PREFIX + shuffled;
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

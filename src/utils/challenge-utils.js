export class ChallengeUtils {
  /**
   * Method used to generate challenge phrase
   * @param  {Array} inputs Array of inputs which form challenge
   * @returns String containing generated challenge phrase
   */
  static generate(...inputs) {
    return inputs.join(process.env.CHALLENGE_JOIN);
  }
}

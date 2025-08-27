export class ChallengeUtils {
  static generate(...inputs) {
    return inputs.join(process.env.CHALLENGE_JOIN);
  }
}
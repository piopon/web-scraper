export class ChallengeUtils {
  static generate(...inputs) {
    return inputs.join("|");
  }
}
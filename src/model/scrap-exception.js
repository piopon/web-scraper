export class ScrapError extends Error {
  constructor(args) {
    super(args);
    this.name = "ScrapError";
  }
}

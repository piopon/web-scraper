export class ScrapError extends Error {
  constructor(args) {
    super(args);
    this.name = "ScrapError";
  }
}

export class ScrapWarning extends Error {
  constructor(args) {
    super(args);
    this.name = "ScrapWarning";
  }
}

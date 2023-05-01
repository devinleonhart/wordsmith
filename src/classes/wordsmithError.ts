export class WordsmithError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WordsmithError";
  }
}

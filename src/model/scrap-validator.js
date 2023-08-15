import { ScrapError, ScrapWarning } from "./scrap-exception.js";

export class ScrapValidator {
  #scrapConfig = undefined;

  /**
   * Creates a new scrap model validator class used to check an input model object
   * @param {Object} scrapConfig The ScrapConfig class which should be validated
   */
  constructor(scrapConfig) {
    if (scrapConfig == null) {
      throw new ScrapError("Cannot validate not existing configuration");
    }
    this.#scrapConfig = scrapConfig;
  }

  /**
   * Performs the validation process of the scrap configuration object (passed in constructor)
   * @returns the validated object, or an error/warning when object has errors/warnings
   */
  validate() {
    const validationResult = this.#scrapConfig.checkValues();
    const errorsNo = validationResult.errors.length;
    if (errorsNo > 0) {
      const additionalCount = errorsNo > 1 ? ` [+${errorsNo - 1} more]` : ``;
      throw new ScrapError(validationResult.errors[0] + additionalCount);
    }
    const warningsNo = validationResult.warnings.length;
    if (warningsNo > 0) {
      const additionalCount = warningsNo > 1 ? ` [+${warningsNo - 1} more]` : ``;
      throw new ScrapWarning(validationResult.warnings[0] + additionalCount);
    }
    return this.#scrapConfig;
  }
}

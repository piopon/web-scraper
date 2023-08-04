import { ScrapError, ScrapWarning } from "./scrap-exception.js";

export class ScrapValidator {
  #validationResult = undefined;
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
    this.#validationResult = { errors: [], warnings: [] };
    for (let groupNo = 0; groupNo < this.#scrapConfig.groups.length; groupNo++) {
      const group = this.#scrapConfig.groups[groupNo];
      this.#validateGroup(group);
      for (let observerNo = 0; observerNo < group.observers.length; observerNo++) {
        const observer = group.observers[observerNo];
        this.#validateObserver(observer);
      }
    }
    const errorsNo = this.#validationResult.errors.length;
    if (errorsNo > 0) {
      const additionalCount = errorsNo > 1 ? ` [+${errorsNo - 1} more]` : ``;
      throw new ScrapError(this.#validationResult.errors[0] + additionalCount);
    }
    const warningsNo = this.#validationResult.warnings.length;
    if (warningsNo > 0) {
      const additionalCount = warningsNo > 1 ? ` [+${warningsNo - 1} more]` : ``;
      throw new ScrapWarning(this.#validationResult.warnings[0] + additionalCount);
    }
    return this.#scrapConfig;
  }

  /**
   * Method used to validate scrap group object
   * @param {Object} group The scrap group to validate
   */
  #validateGroup(group) {
    // domain is needed so the scraper will know the page URL to scan
    if (!group.domain) {
      this.#addError(`Missing required group domain`);
    }
    // check the name and category values against the best experience (non-essential but nice-to-have)
    if (!group.name) {
      this.#addWarning(`Empty group name`);
    }
    if (!group.category) {
      this.#addWarning(`Empty group category`);
    }
  }

  /**
   * Method used to validate scrap observer object
   * @param {Object} observer The scrap observer to validate
   */
  #validateObserver(observer) {
    // path is needed so the scraper will know the exact page to scan
    if (!observer.path) {
      this.#addError(`Missing required observer path`);
    }
    // all the price settings are essential (after all we want to get price information)
    if (!observer.price.selector) {
      this.#addError(`Missing required 'price.selector' in observer ${observer.path}`);
    }
    if (!observer.price.attribute) {
      this.#addError(`Missing required 'price.attribute' in observer ${observer.path}`);
    }
    if (!observer.price.auxiliary) {
      this.#addError(`Missing required 'price.auxiliary' in observer ${observer.path}`);
    }
    // check the title and image settings against the best experience (non-essential but nice-to-have)
    if ((!observer.title.selector || !observer.title.attribute) && !observer.title.auxiliary) {
      this.#addWarning(`Empty title 'selector'/'attribute' and 'auxiliary' in observer ${observer.path}`);
    }
    if ((!observer.image.selector || !observer.image.attribute) && !observer.image.auxiliary) {
      this.#addWarning(`Empty image 'selector'/'attribute' and 'auxiliary' in observer ${observer.path}`);
    }
  }

  /**
   * Method used to add new error to internal array field
   * @param {String} errorMessage The message of error to be added
   */
  #addError(errorMessage) {
    this.#validationResult.errors.push(errorMessage);
  }

  /**
   * Method used to add new warning to internal array field
   * @param {String} warningMessage The message of warning to be added
   */
  #addWarning(warningMessage) {
    this.#validationResult.warnings.push(warningMessage);
  }
}

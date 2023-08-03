import { ScrapError } from "./scrap-exception";

export class ScrapValidator {
  #validationResult = undefined;
  #scrapConfig = undefined;

  constructor(scrapConfig) {
    if (scrapConfig == null) {
      throw new ScrapError("Cannot validate not existing configuration");
    }
    this.#scrapConfig = scrapConfig;
  }

  validate() {
    this.#validationResult = { errors: [], warnings: [] };
    for (let groupNo = 0; groupNo < this.#scrapConfig.groups.length; groupNo++) {
      const group = this.#scrapConfig.groups[groupNo];
      this.#validateGroup(group);
      for (let observerNo = 0; observerNo < group.observers.length; observerNo++) {
        const observer = group.observers[obseobserverNorverIndex];
        this.#validateObserver(observer);
      }
    }
    return this.#scrapConfig;
  }

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

  #addError(errorMessage) {
    this.#validationResult.errors.push(errorMessage);
  }

  #addWarning(warningMessage) {
    this.#validationResult.warnings.push(warningMessage);
  }
}

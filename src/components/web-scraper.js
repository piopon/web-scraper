import { RegexUtils } from "../utils/regex-utils.js";
import { ScrapConfig } from "../model/scrap-config.js";
import { ScrapWarning } from "../model/scrap-exception.js";
import { ScrapValidator } from "../model/scrap-validator.js";
import { StatusLogger } from "./status-logger.js";
import { TimeoutError } from "puppeteer";

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export class WebScraper {
  static #COMPONENT_NAME = "web-scraper ";
  static #RUNNING_STATUS = "Running";

  #scrapingInProgress = false;
  #setupConfig = undefined;
  #scrapConfig = undefined;
  #intervalId = undefined;
  #browser = undefined;
  #page = undefined;
  #status = undefined;

  /**
   * Creates a new web scraper with specified configuration
   * @param {Object} config The object containing scraper configuration
   */
  constructor(config) {
    this.#setupConfig = config;
    this.#status = new StatusLogger(WebScraper.#COMPONENT_NAME, config.minLogLevel);
    this.#status.info("Created");
  }

  /**
   * Method used to start web scraping action
   */
  async start(user = undefined) {
    this.#status.info(`Starting for user '${user.name}'`);
    // create a new empty configuration file and directory if none exists
    const configDirectory = path.dirname(this.#setupConfig.dataConfigPath);
    if (!fs.existsSync(configDirectory)) {
      fs.mkdirSync(configDirectory, { recursive: true });
    }
    if (!fs.existsSync(this.#setupConfig.dataConfigPath)) {
      const newConfig = { user: 0, groups: [] };
      fs.writeFileSync(this.#setupConfig.dataConfigPath, JSON.stringify(newConfig, null, 2));
      this.#status.info(`Created new ${path.basename(this.#setupConfig.dataConfigPath)}`);
    }
    this.#status.info("Reading configuration");
    // parse source scraper configuration file to a config class
    try {
      var configCandidate = await ScrapConfig.getDatabaseModel().findById(user.config);
      this.#scrapConfig = new ScrapValidator(configCandidate).validate();
    } catch (e) {
      if (e instanceof ScrapWarning) {
        this.#scrapConfig = configCandidate;
        this.#status.warning(e.message);
      } else {
        this.stop(`Invalid scrap config: ${e.message}`);
        return;
      }
    }
    this.#status.info("Initializing");
    // open new Puppeteer virtual browser and an initial web page
    this.#browser = await puppeteer.launch({ headless: "new" });
    this.#page = await this.#browser.newPage();
    this.#page.setDefaultTimeout(this.#setupConfig.scraperConfig.defaultTimeout);
    // invoke scrap data action initially and setup interval calls
    if (true === (await this.#scrapData())) {
      const intervalTime = this.#setupConfig.scraperConfig.scrapInterval;
      this.#intervalId = setInterval(() => this.#scrapData(), intervalTime);
      this.#status.info(`${WebScraper.#RUNNING_STATUS} (every: ${intervalTime / 1000} seconds)`);
    }
  }

  /**
   * Method used to stop web scraping action
   * @param {String} reason The message with a web scraper stop reason. Non-empty value is treated as error.
   * @param {Boolean} takeScreenshot Flag responsible for creating an additional screenshot.
   */
  async stop(reason = "", takeScreenshot = false) {
    // stop running method in constant time intervals
    if (this.#intervalId != null) {
      clearInterval(this.#intervalId);
      this.#intervalId = undefined;
    }
    // update status and make error screenshot
    if (reason.length === 0) {
      this.#status.info("Stopped");
    } else {
      if (this.#status.getStatus().message !== reason) {
        this.#status.error(reason);
        if (takeScreenshot) {
          await this.#createErrorScreenshot(this.#status.getStatus());
        }
      }
    }
    // update internal object state
    this.#scrapingInProgress = false;
    // close currently opened page and browser
    try {
      if (this.#page != null) {
        await this.#page.close();
      }
      if (this.#browser != null) {
        await this.#browser.close();
      }
    } catch (warning) {
      this.#status.warning(`Stop issue: ${warning.message}`);
    }
  }

  /**
   * Method used to return the name of the component
   * @returns web scraper component name
   */
  getName() {
    return WebScraper.#COMPONENT_NAME;
  }

  /**
   * Method used to determine if the web scraper component is running (alive) or not
   * @returns true when web scraper is running, false otherwise
   */
  isAlive() {
    return this.#intervalId != null;
  }

  /**
   * Method used to receive running history status of web scraper
   * @returns array of objects containing web scraper running history status
   */
  getStatusHistory() {
    const invalidStateMessage = "Invalid internal state";
    const currentStatus = this.#status.getStatus().message;
    if (this.#intervalId == null) {
      // scraper is NOT running in selected intervals
      if (currentStatus.startsWith(WebScraper.#RUNNING_STATUS)) {
        // incorrect state - update field
        this.#status.error(invalidStateMessage);
      }
    } else {
      // scraper is running in selected intervals
      if (!currentStatus.startsWith(WebScraper.#RUNNING_STATUS)) {
        // incorrect state - since it's running then we must stop it
        this.stop(invalidStateMessage);
      }
    }
    return this.#status.getHistory();
  }

  /**
   * Method containing core web scraping logic (according to scrap user settings)
   * @returns true if scrap logic completed with no errors, false otherwise
   */
  async #scrapData() {
    if (this.#scrapConfig == null) {
      this.stop("Missing scrap configuration");
      return false;
    }
    if (this.#scrapingInProgress) {
      this.#status.warning("Skipping current scrap iteration - previous one in progress");
      return false;
    }
    const data = [];
    this.#scrapingInProgress = true;
    for (let groupIndex = 0; groupIndex < this.#scrapConfig.groups.length; groupIndex++) {
      const group = this.#scrapConfig.groups[groupIndex];
      const groupObject = { name: group.name, category: group.category, items: [] };
      for (let observerIndex = 0; observerIndex < group.observers.length; observerIndex++) {
        const observer = group.observers[observerIndex];
        const page = new URL(observer.path, group.domain);
        try {
          await this.#navigateToPage(page, observer);
        } catch (error) {
          this.stop(`Incorrect scrap configuration: Cannot find price element in page ${page}`, true);
          return false;
        }
        const dataObj = await this.#page.evaluate((observer) => {
          try {
            // try to get data container
            const dataContainer = document.querySelector(observer.container);
            if (dataContainer == null) {
              throw new Error("Cannot find data container");
            }
            // define data getter function
            const getData = (selector, attribute, auxiliary) => {
              if (selector && attribute) {
                const component = Object.keys(observer).filter((key) => observer[key].selector === selector);
                const element = dataContainer.querySelector(selector);
                if (element == null) {
                  throw new Error(`Cannot find ${component} element of ${observer.path}`);
                }
                const value = element[attribute];
                if (value == null) {
                  throw new Error(`Cannot find ${component} value of ${observer.path}`);
                }
                return value;
              }
              return auxiliary;
            };
            // return an object with collected data
            return {
              name: getData(observer.title.selector, observer.title.attribute, observer.title.auxiliary),
              icon: getData(observer.image.selector, observer.image.attribute, observer.image.auxiliary),
              price: getData(observer.price.selector, observer.price.attribute),
              currency: observer.price.auxiliary,
            };
          } catch (error) {
            return { err: error.message };
          }
        }, observer);
        const validationResult = this.#validateData(dataObj);
        if (validationResult.length > 0) {
          this.stop(validationResult, true);
          return false;
        }
        groupObject.items.push(this.#formatData(dataObj));
      }
      data.push(groupObject);
    }
    this.#saveData(data);
    this.#scrapingInProgress = false;
    return true;
  }

  /**
   * Method used to go to a specified URL and wait until an observer selector is available
   * @param {String} pageUrl The address of a page to navigate to
   * @param {Object} observer The observer which has the selector definition to find on a page
   */
  async #navigateToPage(pageUrl, observer) {
    let attempt = 1;
    let foundSelector = false;
    const maxAttempts = this.#setupConfig.scraperConfig.timeoutAttempts;
    while (!foundSelector) {
      try {
        await this.#page.goto(pageUrl, { waitUntil: observer.target });
        await this.#page.waitForSelector(observer.price.selector, { visible: true });
        foundSelector = true;
      } catch (error) {
        if (attempt <= maxAttempts && error instanceof TimeoutError) {
          this.#status.warning(`Timeout when waiting for: ${observer.price.selector} [${attempt}/${maxAttempts}]`);
          attempt++;
          continue;
        }
        throw error;
      }
    }
  }

  /**
   * Method used to save specified object in a destination file (its path stored in configuration object)
   * @param {Object} dataToSave The data object to save in destination file
   */
  #saveData(dataToSave) {
    const dataDirectory = path.dirname(this.#setupConfig.dataOutputPath);
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    fs.writeFileSync(this.#setupConfig.dataOutputPath, JSON.stringify(dataToSave, null, 2));
  }

  /**
   * Method used to format data in the specified data object
   * @param {Object} dataObj The object which we want to format
   * @returns formatted object
   */
  #formatData(dataObj) {
    // assure that price attribute contains only value with dot
    dataObj.price = RegexUtils.getPrices(dataObj.price)[0];
    return dataObj;
  }

  /**
   * Method used to validate data in the specified data object
   * @param {Object} dataObj The object which we want to validate
   * @returns empty string if passed object is valid, non-empty string otherwise
   */
  #validateData(dataObj) {
    if (dataObj.err != null) {
      return `Incorrect scrap configuration: ${dataObj.err}`;
    }
    const objectName = dataObj.name ? dataObj.name : "[unnamed]";
    if (dataObj.price == null || dataObj.price.length === 0) {
      return `Invalid scraped data: Missing price value for ${objectName}`;
    }
    const priceParsed = RegexUtils.getPrices(dataObj.price);
    if (priceParsed == null || priceParsed.length !== 1) {
      return `Invalid scraped data: Incorrect price value for ${objectName}`;
    }
    return "";
  }

  /**
   * Method used to create an error screenshot of current web page (if present)
   * @param {Object} error The occured error object
   */
  async #createErrorScreenshot(error) {
    if (this.#page && error.type.length > 0) {
      if (!fs.existsSync(this.#setupConfig.screenshotPath)) {
        fs.mkdirSync(this.#setupConfig.screenshotPath, { recursive: true });
      }
      const screenshotName = `error_${error.timestamp.replaceAll(":", "-").replaceAll(" ", "_")}.png`;
      const screenshotPath = path.join(this.#setupConfig.screenshotPath, screenshotName);
      await this.#page.screenshot({ path: screenshotPath });
    }
  }
}

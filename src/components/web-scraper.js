import { RegexUtils } from "../utils/regex-utils.js";
import { ScrapConfig } from "../model/scrap-config.js";
import { ScrapWarning } from "../model/scrap-exception.js";
import { ScrapValidator } from "../model/scrap-validator.js";
import { StatusLogger } from "./status-logger.js";

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export class WebScraper {
  static #LOGGER_NAME = "web-scraper";
  static #RUNNING_STATUS = "Running";

  #status = new StatusLogger(WebScraper.#LOGGER_NAME);
  #setupConfig = undefined;
  #scrapConfig = undefined;
  #intervalId = undefined;
  #browser = undefined;
  #page = undefined;

  /**
   * Creates a new web scraper with specified configuration
   * @param {Object} config The object containing scraper configuration
   */
  constructor(config) {
    this.#setupConfig = config;
    this.#status.log("Created");
  }

  /**
   * Method used to start web scraping action
   */
  async start() {
    this.#status.log("Starting");
    // create a new empty configuration file and directory if none exists
    const configDirectory = path.dirname(this.#setupConfig.dataConfigPath);
    if (!fs.existsSync(configDirectory)) {
      fs.mkdirSync(configDirectory, { recursive: true });
    }
    if (!fs.existsSync(this.#setupConfig.dataConfigPath)) {
      const newConfig = { user: 0, groups: [] };
      fs.writeFileSync(this.#setupConfig.dataConfigPath, JSON.stringify(newConfig, null, 2));
      this.#status.log(`Created new ${path.basename(this.#setupConfig.dataConfigPath)}`);
    }
    this.#status.log("Reading configuration");
    // parse source scraper configuration file to a config class
    try {
      var scrapJson = JSON.parse(fs.readFileSync(this.#setupConfig.dataConfigPath));
      var scrapConfigCandidate = new ScrapConfig(scrapJson);
      this.#scrapConfig = new ScrapValidator(scrapConfigCandidate).validate();
    } catch (e) {
      if (e instanceof ScrapWarning) {
        this.#scrapConfig = scrapConfigCandidate;
        this.#status.warning(e.message);
      } else {
        this.stop(`Invalid scrap config: ${e.message}`);
        return;
      }
    }
    this.#status.log("Initializing");
    // open new Puppeteer virtual browser and an initial web page
    this.#browser = await puppeteer.launch({ headless: "new" });
    this.#page = await this.#browser.newPage();
    this.#page.setDefaultTimeout(this.#setupConfig.scraperConfig.defaultTimeout);
    // invoke scrap data action initially and setup interval calls
    if (true === (await this.#scrapData())) {
      this.#intervalId = setInterval(() => this.#scrapData(), this.#setupConfig.scraperConfig.scrapInterval);
      this.#status.log(WebScraper.#RUNNING_STATUS);
    }
  }

  /**
   * Method used to stop web scraping action
   * @param {String} reason Optional message with the reason for stopping the web scraping.
   *                        Non-empty value will be interpreted as error.
   */
  async stop(reason = "") {
    try {
      if (this.#intervalId != null) {
        clearInterval(this.#intervalId);
        this.#intervalId = undefined;
      }
      if (this.#page != null) {
        await this.#page.close();
      }
      if (this.#browser != null) {
        await this.#browser.close();
      }
    } catch (warning) {
      this.#status.warning(`Stop issue: ${warning.message}`);
    }
    if (reason.length === 0) {
      this.#status.log("Stopped");
    } else {
      if (this.#status.getStatus().message !== reason) {
        this.#status.error(reason);
      }
    }
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
      if (currentStatus === WebScraper.#RUNNING_STATUS) {
        // incorrect state - update field
        this.#status.error(invalidStateMessage);
      }
    } else {
      // scraper is running in selected intervals
      if (currentStatus !== WebScraper.#RUNNING_STATUS) {
        // incorrect state - since it's running then we must stop it
        this.stop(invalidStateMessage);
      }
    }
    return this.#status.getHistory();
  }

  /**
   * Method used to determine if the web scraper component is running (alive) or not
   * @returns true when web scraper is running, false otherwise
   */
  isAlive() {
    const currentStatus = this.#status.getStatus().message;
    return this.#intervalId != null && currentStatus === WebScraper.#RUNNING_STATUS;
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
    const data = [];
    for (let groupIndex = 0; groupIndex < this.#scrapConfig.groups.length; groupIndex++) {
      const group = this.#scrapConfig.groups[groupIndex];
      const groupObject = { name: group.name, category: group.category, items: [] };
      for (let observerIndex = 0; observerIndex < group.observers.length; observerIndex++) {
        const observer = group.observers[observerIndex];
        const page = new URL(observer.path, group.domain);
        try {
          await this.#page.goto(page);
          await this.#page.waitForSelector(observer.price.selector, { visible: true });
        } catch (error) {
          this.stop("Incorrect scrap configuration: Cannot find price element");
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
          this.stop(validationResult);
          return false;
        }
        groupObject.items.push(this.#formatData(dataObj));
      }
      data.push(groupObject);
    }
    this.#saveData(data);
    return true;
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
}

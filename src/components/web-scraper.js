import { ScrapConfig } from "../model/scrap-config.js";

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export class WebScraper {
  #status = "OK";
  #scraperConfig = undefined;
  #scrapConfig = undefined;
  #intervalId = undefined;
  #browser = undefined;
  #page = undefined;

  /**
   * Creates a new web scraper with specified configuration
   * @param {Object} config The object containing scraper configuration
   */
  constructor(config) {
    this.#scraperConfig = config;
  }

  /**
   * Method used to start web scraping action
   */
  async start() {
    // create a new empty configuration file and directory if none exists
    const configDirectory = path.dirname(this.#scraperConfig.srcFile);
    if (!fs.existsSync(configDirectory)) {
      fs.mkdirSync(configDirectory, { recursive: true });
    }
    if (!fs.existsSync(this.#scraperConfig.srcFile)) {
      const newConfig = { user: 0, groups: [] };
      fs.writeFileSync(this.#scraperConfig.srcFile, JSON.stringify(newConfig, null, 2));
    }
    // parse source scraper configuration file to a config class
    try {
      const scrapJson = JSON.parse(fs.readFileSync(this.#scraperConfig.srcFile));
      this.#scrapConfig = new ScrapConfig(scrapJson);
    } catch (error) {
      this.stop(`Cannot create scrap config: ${error.message}`);
      return;
    }
    // open new Puppeteer virtual browser and an initial web page
    this.#browser = await puppeteer.launch({ headless: "new" });
    this.#page = await this.#browser.newPage();
    // invoke scrap data action initially and setup interval calls
    this.#scrapData();
    this.#intervalId = setInterval(() => this.#scrapData(), this.#scraperConfig.interval);
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
      console.warn(`WARNING: Stop issue: ${warning.message}`);
    }
    if (reason.length === 0) {
      this.#status = "OK";
    } else {
      const errorMessage = `ERROR: ${reason}`;
      if (this.#status !== errorMessage) {
        this.#status = errorMessage;
        console.error(errorMessage);
      }
    }
  }

  /**
   * Method used to receive current working status of web scraper
   * @returns String with web scraper working status (OK or ERROR)
   */
  getStatus() {
    const invalidStateMessage = "Invalid internal state";
    if (this.#intervalId == null) {
      // scraper is NOT running in selected intervals
      if (this.#status === "OK") {
        // incorrect state - update field
        this.#status = `ERROR: ${invalidStateMessage}`;
      }
      return this.#status;
    } else {
      // scraper is running in selected intervals
      if (this.#status !== "OK") {
        // incorrect state - since it's running then we must stop it
        this.stop(invalidStateMessage);
      }
      return this.#status;
    }
  }

  /**
   * Method containing core web scraping logic (according to scrap user settings)
   */
  async #scrapData() {
    if (this.#scrapConfig == null) {
      this.stop("Missing scrap configuration");
      return;
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
          return;
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
        if (dataObj.err != null) {
          this.stop("Incorrect scrap configuration: " + dataObj.err);
          return;
        }
        const validationResult = this.#validateData(dataObj);
        if (validationResult.length > 0) {
          this.stop(validationResult);
          return;
        }
        groupObject.items.push(this.#formatData(dataObj));
      }
      data.push(groupObject);
    }
    this.#saveData(data);
  }

  /**
   * Method used to save specified object to be saved in destination file (stored in configuration object)
   * @param {Object} dataToSave The data object to save in destination file
   */
  #saveData(dataToSave) {
    const dataDirectory = path.dirname(this.#scraperConfig.dstFile);
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    fs.writeFile(this.#scraperConfig.dstFile, JSON.stringify(dataToSave, null, 2), (err) => {
      if (err) throw err;
    });
  }

  /**
   * Method used to format data in the passed data object
   * @param {Object} dataObj The object which we want to format
   * @returns formatted object
   */
  #formatData(dataObj) {
    // assure that price attribute contains only value with dot
    dataObj.price = this.#getPriceValue(dataObj)[0];
    return dataObj;
  }

  /**
   * Method used to validate data in the passed data object
   * @param {Object} dataObj The object which we want to validate
   * @returns empty string if passed object is valid, non-empty string otherwise
   */
  #validateData(dataObj) {
    const objectName = dataObj.name ? dataObj.name : "[unnamed]";
    if (dataObj.price == null || dataObj.price.length === 0) {
      return `Invalid scraped data: Missing price value for ${objectName}`;
    }
    const priceParsed = this.#getPriceValue(dataObj);
    if (priceParsed == null || priceParsed.length !== 1) {
      return `Invalid scraped data: Incorrect price value for ${objectName}`;
    }
    return "";
  }

  #getPriceValue(dataObj) {
    return dataObj.price.replace(",", ".").match(/\d+(?:\.\d+)?/g);
  }
}

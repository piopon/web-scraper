import { ScrapConfig } from "../model/scrap-config.js";

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export class WebScraper {
  #scraperConfig = undefined;
  #scrapConfig = undefined;
  #intervalId = undefined;
  #browser = undefined;
  #page = undefined;

  /**
   * Creates a new web scraper with specified configuration
   * @param {Object} config object containing the scraper configuration
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
      const newConfig = { "user": 0, "groups": [] };
      fs.writeFileSync(this.#scraperConfig.srcFile, JSON.stringify(newConfig, null, 2));
    }
    // parse source scraper configuration file to a config class
    const scrapJson = JSON.parse(fs.readFileSync(this.#scraperConfig.srcFile));
    this.#scrapConfig = new ScrapConfig(scrapJson);
    // open new Puppeteer virtual browser and an initial web page
    this.#browser = await puppeteer.launch({ headless: "new" });
    this.#page = await this.#browser.newPage();
    // invoke scrap data action initially and setup interval calls
    this.#scrapData();
    this.#intervalId = setInterval(() => this.#scrapData(), this.#scraperConfig.interval);
  }

  /**
   * Method used to stop web scraping action
   */
  async stop() {
    if (this.#intervalId !== undefined) {
      clearInterval(intervalId);
    }
    await this.#page.close();
    await this.#browser.close();
  }

  /**
   * Method containing core web scraping logic (according to scrap user settings)
   */
  async #scrapData() {
    const data = [];
    for (let groupIndex = 0; groupIndex < this.#scrapConfig.groups.length; groupIndex++) {
      const group = this.#scrapConfig.groups[groupIndex];
      const groupObject = { name: group.name, category: group.category, items: [] };
      for (let observerIndex = 0; observerIndex < group.observers.length; observerIndex++) {
        const observer = group.observers[observerIndex];
        const page = new URL(observer.path, group.domain);
        await this.#page.goto(page);
        await this.#page.waitForSelector(observer.price.selector, { visible: true });
        const dataObj = await this.#page.evaluate((observer) => {
          const dataContainer = document.querySelector(observer.container);
          const getData = (selector, attribute, auxiliary) =>
            selector || attribute ? dataContainer.querySelector(selector)[attribute] : auxiliary;
          return {
            name: getData(observer.title.selector, observer.title.attribute, observer.title.auxiliary),
            icon: getData(observer.image.selector, observer.image.attribute, observer.image.auxiliary),
            price: getData(observer.price.selector, observer.price.attribute),
            currency: observer.price.auxiliary
          };
        }, observer);
        groupObject.items.push(this.#formatData(dataObj));
      }
      data.push(groupObject);
    }
    this.#saveData(data);
  }

  /**
   * Method used to save specified object to be saved in destination file (stored in configuration object)
   * @param {Object} dataToSave data object to save in destination file
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
   * @param {Object} dataObj the object which we want to format
   * @returns formatted object
   */
  #formatData(dataObj) {
    // assure that price attribute contains only value with dot
    dataObj.price = dataObj.price.replace(',', '.').match(/\d+(?:\.\d+)?/g)[0];
    return dataObj;
  }
}

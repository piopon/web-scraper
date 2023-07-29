import { ScrapConfig } from "../model/scrap-config.js";

import puppeteer from "puppeteer";
import path from "path";
import url from "url";
import fs from "fs";

export class WebScraper {
  #scrapConfig = undefined;
  #intervalId = undefined;
  #browser = undefined;
  #page = undefined;

  constructor(jsonConfig) {
    this.#scrapConfig = new ScrapConfig(jsonConfig);
  }

  async start() {
    this.#browser = await puppeteer.launch({ headless: "new" });
    this.#page = await this.#browser.newPage();
    this.#scrapData();
    this.#intervalId = setInterval(() => this.#scrapData(), 30_000);
  }

  async stop() {
    if (this.#intervalId !== undefined) {
      clearInterval(intervalId);
    }
    await this.#page.close();
    await this.#browser.close();
  }

  async #scrapData() {
    const data = [];
    for (let groupIndex = 0; groupIndex < this.#scrapConfig.groups.length; groupIndex++) {
      const group = this.#scrapConfig.groups[groupIndex];
      const groupObject = { name: group.name, items: [] };
      for (let observerIndex = 0; observerIndex < group.observers.length; observerIndex++) {
        const observer = group.observers[observerIndex];
        const page = new URL(observer.path, group.domain);
        await this.#page.goto(page);
        await this.#page.waitForSelector(observer.price.selector, { visible: true });
        const dataObj = await this.#page.evaluate((observer) => {
          const dataContainer = document.querySelector(observer.container);
          const getData = (selector, attribute) => dataContainer.querySelector(selector)[attribute];
          return {
            name: getData(observer.title.selector, observer.title.attribute),
            icon: getData(observer.image.selector, observer.image.attribute),
            price: getData(observer.price.selector, observer.price.attribute),
          };
        }, observer);
        groupObject.items.push(dataObj);
      }
      data.push(groupObject);
    }
    this.#saveData(data);
  }

  #saveData(dataToSave) {
    const dataDirectory = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..", "data");
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory);
    }
    fs.writeFile(path.join(dataDirectory, "data.json"), JSON.stringify(dataToSave, null, 2), (err) => {
      if (err) throw err;
    });
  }
}

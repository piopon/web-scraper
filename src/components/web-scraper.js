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

  async #scrapData() {
    const data = [];
    for (let groupIndex = 0; groupIndex < this.#scrapConfig.groups.length; groupIndex++) {
      const group = this.#scrapConfig.groups[groupIndex];
      for (let observerIndex = 0; observerIndex < group.observers.length; observerIndex++) {
        const observer = group.observers[observerIndex];
        const page = new URL(observer.path, group.domain);
        await this.#page.goto(page);
        await this.#page.waitForSelector(observer.price.selector, { visible: true });
        const obj = await this.#page.evaluate(() => {
          const dataContainer = document.querySelector("div[class^=symbolRow]");
          return {
            name: dataContainer.querySelector("h1").innerHTML,
            icon: dataContainer.querySelector("img[class^=tv-circle-logo]").src,
            price: dataContainer.querySelector("span[class^=last] span").innerHTML,
          };
        });
        data.push(obj);
      }
    }

    const fileContent = [
      {
        name: "stock",
        items: data,
      },
    ];

    const dataDirectory = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..", "data");
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory);
    }
    fs.writeFile(path.join(dataDirectory, "data.json"), JSON.stringify(fileContent, null, 2), (err) => {
      if (err) throw err;
    });
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
}

import { ScrapConfig } from "../model/scrap-config.js";

import puppeteer from "puppeteer";
import path from "path";
import url from "url";
import fs from "fs";

export class WebScraper {
  #intervalId = undefined;
  #scrapConfig = undefined;

  constructor(jsonConfig) {
    this.#scrapConfig = new ScrapConfig(jsonConfig);
  }

  async #scrapData() {
    const sourcePages = [
      "https://www.tradingview.com/symbols/GPW-CDR/",
      "https://www.tradingview.com/symbols/NYSE-T/"
    ];
    const data = [];
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    for (let i = 0; i < sourcePages.length; i++) {
      await page.goto(sourcePages[i]);
      await page.waitForSelector("span[class^=last] span", { visible: true });
      const obj = await page.evaluate(() => {
        const dataContainer = document.querySelector("div[class^=symbolRow]");
        return {
          name: dataContainer.querySelector("h1").innerHTML,
          icon: dataContainer.querySelector("img[class^=tv-circle-logo]").src,
          price: dataContainer.querySelector("span[class^=last] span").innerHTML,
        };
      });
      data.push(obj);
    }

    await page.close();
    await browser.close();

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

  start() {
    this.#scrapData();
    this.#intervalId = setInterval(this.#scrapData, 30_000);
  }

  stop() {
    if (this.#intervalId !== undefined) {
      clearInterval(intervalId);
    }
  }
}

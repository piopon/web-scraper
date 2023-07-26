import puppeteer from "puppeteer";
import path from 'path';
import url from 'url';
import fs from 'fs';

let intervalId = undefined;

const sourcePages = [
  "https://www.tradingview.com/symbols/GPW-CDR/",
  "https://www.tradingview.com/symbols/NYSE-T/"
]

async function scrapData() {
  const data = [];
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  for (let i = 0; i < sourcePages.length; i++) {
    await page.goto(sourcePages[i]);
    await page.waitForSelector('span[class^=last] span', {visible: true});
    const obj = await page.evaluate(() => {
      const dataContainer = document.querySelector('div[class^=symbolRow]');
      return {
        name: dataContainer.querySelector('h1').innerHTML,
        price: dataContainer.querySelector('span[class^=last] span').innerHTML
      };
    });
    data.push(obj);
  }

  await page.close();
  await browser.close();

  const fileContent = [
    {
      domain : "tradingview.com",
      items : data,
    }
  ];

  const dataDirectory = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'data');
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
  }
  fs.writeFile('../data/data.json', JSON.stringify(fileContent, null, 2), (err) => {
    if (err) throw err;
  })
}

export function start() {
    scrapData();
    intervalId = setInterval(scrapData, 30_000);
}

export function stop() {
    if (intervalId !== undefined) {
        clearInterval(intervalId);
    }
}

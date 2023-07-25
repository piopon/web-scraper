import puppeteer from "puppeteer";
import fs from 'fs';

let intervalId = undefined;

async function scrapData() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto("https://www.tradingview.com/symbols/NYSE-T/");

  const data = await page.evaluate(() => {
    const dataContainer = document.querySelector('div[class^="symbolRow"]');
    return {
        name: dataContainer.querySelector('h1').innerHTML,
        price: dataContainer.querySelector('span[class^="last"] span').innerHTML
    };
  });
  const fileContent = [
    {
      group : "tradingview.com",
      items : [ data ],
    }
  ];
  fs.writeFile('../data/data.json', JSON.stringify(fileContent, null, 2), (err) => {
    if (err) throw err;
  })

  await browser.close();
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

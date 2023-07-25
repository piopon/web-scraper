import puppeteer from "puppeteer";

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
  console.log(data);

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

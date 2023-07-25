import puppeteer from 'puppeteer';

async function scrapData() {
    const browser = await puppeteer.launch({ headless: 'new'});
    const page = await browser.newPage();

    await page.goto('https://tradingview.com/symbols/GPW-CDR/');
    await page.screenshot({ path: 'test.png', type: "png" });

    await browser.close();
}

scrapData();
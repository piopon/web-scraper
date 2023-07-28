import { WebScraper } from "./components/web-scraper.js";

import fs from 'fs';

const jsonPath = "./config/scrap-config.json"
const jsonConfig = JSON.parse(fs.readFileSync(jsonPath));
const webScraper = new WebScraper(jsonConfig);

webScraper.start();
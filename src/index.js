import { AppConfig } from "../config/app-config.js";
import { WebScraper } from "./components/web-scraper.js";

const config = new AppConfig().getConfig();
const webScraper = new WebScraper(config.scraperConfig);

webScraper.start();

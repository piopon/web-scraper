import { AppConfig } from "../config/app-config.js";
import { WebScraper } from "./components/web-scraper.js";
import { WebServer } from "./components/web-server.js";

// initialize application config
const config = new AppConfig().getConfig();
// create dependent components
const webScraper = new WebScraper(config.scraperConfig);
// create and start webserver
const webServer = new WebServer(config.serverConfig);
webServer.addComponent(webScraper);
webServer.start();

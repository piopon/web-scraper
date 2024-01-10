import { AppConfig } from "../config/app-config.js";
import { WebDatabase } from "./components/web-database.js";
import { WebScraper } from "./components/web-scraper.js";
import { WebServer } from "./components/web-server.js";

// temporary user ID
const userId = 0;
// initialize application config
const config = new AppConfig().getConfig();
// create dependent components
const webDatabase = new WebDatabase(config);
const webScraper = new WebScraper(config, userId);
// create and start webserver
const webServer = new WebServer(config);
webServer.addComponent(webDatabase);
webServer.addComponent(webScraper);
webServer.run();

process.on("SIGTERM", () => webServer.shutdown());

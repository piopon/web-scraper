import { AppConfig } from "../config/app-config.js";
import { ComponentType } from "../config/app-types.js";
import { WebDatabase } from "./components/web-database.js";
import { WebScraper } from "./components/web-scraper.js";
import { WebServer } from "./components/web-server.js";

// initialize application config
const config = new AppConfig().getConfig();
// create dependent components
const webDatabase = new WebDatabase(config);
const webScraper = new WebScraper(config);
// create and start webserver
const webServer = new WebServer(config);
webServer.addComponent({ type: ComponentType.INIT, mustPass: false, item: webDatabase });
webServer.addComponent({ type: ComponentType.LOGIN, mustPass: true, item: webScraper });
webServer.run();

process.on("SIGTERM", () => webServer.shutdown());

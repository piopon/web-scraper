import { AppConfig } from "../config/app-config.js";
import { WebComponents } from "./components/web-components.js";
import { WebDatabase } from "./components/web-database.js";
import { WebScraper } from "./components/web-scraper.js";
import { WebServer } from "./components/web-server.js";

try {
  // initialize application config
  const config = new AppConfig().getConfig();
  // create dependent components
  const webComponents = new WebComponents(config);
  const webDatabase = new WebDatabase(config);
  const webScraper = new WebScraper(config);
  webComponents.addComponent(webDatabase);
  webComponents.addComponent(webScraper);
  // create and start webserver
  const webServer = new WebServer(config, webComponents);
  webServer.run();
  // handle user termination signal
  process.on("SIGTERM", () => webServer.shutdown());
} catch (exception) {
  console.error(exception.message);
}

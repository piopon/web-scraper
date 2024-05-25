import { AppConfig } from "../config/app-config.js";
import { WebComponents } from "./components/web-components.js";
import { WebDatabase } from "./components/web-database.js";
import { WebScraper } from "./components/web-scraper.js";
import { WebServer } from "./components/web-server.js";

try {
  // initialize application config
  const config = new AppConfig().getConfig();
  // create server dependent components
  const components = new WebComponents(config);
  components.addComponent(new WebDatabase(config));
  components.addComponent(new WebScraper(config));
  // create and start web server
  const webServer = new WebServer(config, components);
  if (webServer.run()) {
    // handle user termination signal
    process.on("SIGTERM", () => webServer.shutdown());
  }
} catch (exception) {
  console.error(exception.message);
}

export class ConfigRouter {
  #configFilePath = undefined;

  /**
   * Creates a new config router for configuring appropriate endpoints
   * @param {String} configFilePath The path to the configuration file
   */
  constructor(dataFile) {
    this.#configFilePath = dataFile;
  }

  /**
   * Method used to create routes for scraping ocnfiguration values
   * @returns router object for handling config requests
   */
  createRoutes() {
    const router = express.Router();

    return router;
  }
}

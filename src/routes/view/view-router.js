import express from "express";

export class ViewRouter {
  #configFilePath = undefined;

  /**
   * Creates a new view router for displaying configuraion file for the user
   * @param {String} configFile The path to the configuration file
   */
  constructor(configFile) {
    this.#configFilePath = configFile;
  }

  /**
   * Method used to create routes for view endpoints
   * @returns router object for handling view requests
   */
  createRoutes() {
    const router = express.Router();
    router.get("/", (request, response) => response.render("index", { title: "web-scraper: home" }));
    router.get("/status", (request, response) => response.render("status", { title: "web-scraper: status" }));
    return router;
  }
}

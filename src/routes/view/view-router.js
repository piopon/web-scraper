import express from "express";

export class ViewRouter {
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

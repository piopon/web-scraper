import express from "express";

export class ViewRouter {
  /**
   * Method used to create routes for view endpoints
   * @returns router object for handling view requests
   */
  createRoutes() {
    const router = express.Router();
    router.get("/", (request, response) => response.render("index"));
    router.get("/status", (request, response) => response.render("status"));
    return router;
  }
}

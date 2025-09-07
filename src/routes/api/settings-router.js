import express from "express";

export class SettingsRouter {
  createRoutes() {
    const router = express.Router();
    router.post("/import", async (request, response) => {
      response.status(200).json("OK");
    });
    return router;
  }
}

import express from "express";

export class DataRouter {
  #dataFilePath = undefined;

  constructor(dataFile) {
    this.#dataFilePath = dataFile;
  }

  /**
   * Method used to create routes for scraped data values
   * @returns router object for handling data requests
   */
  createRoutes() {
    const router = express.Router();
    // create endpoint for receiving all data
    router.get("/", (request, response) => {
      response.status(200).json("getting all data");
    });
    // create endpoint for receiving data with specified name
    router.get("/:name", (request, response) => {
      response.status(200).json(`getting data with name: ${request.params.name}`);
    });
    return router;
  }
}

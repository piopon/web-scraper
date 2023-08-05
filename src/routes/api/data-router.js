import express from "express";
import fs from "fs";

export class DataRouter {
  #dataFilePath = undefined;

  /**
   * Creates a new data router for configuring appropriate endpoints
   * @param {String} dataFile The path to the data file
   */
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
      var dataContent = JSON.parse(fs.readFileSync(this.#dataFilePath));
      response.status(200).json(dataContent);
    });
    // create endpoint for receiving data with specified name
    router.get("/:name", (request, response) => {
      var dataContent = JSON.parse(fs.readFileSync(this.#dataFilePath));
      var searchedData = dataContent.filter((data) => data.name === request.params.name);
      if (searchedData.length > 0) {
        response.status(200).json(searchedData);
      } else {
        response.status(400).json(`No data with name: ${request.params.name}`);
      }
    });
    return router;
  }
}

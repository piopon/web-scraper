import Ajv from "ajv";
import express from "express";
import fs from "fs";
import path from "path";

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
    // create endpoint for receiving data according specified query param filters
    router.get("/", (request, response) => {
      const validationResult = this.#validateQueryParams(request.query);
      if (!validationResult.valid) {
        response.status(400).json(validationResult.cause);
        return;
      }
      const userPath = path.join(this.#dataFilePath, request.query.owner, "data.json");
      var dataContent = JSON.parse(fs.readFileSync(userPath));
      var filteredData = dataContent.filter((data) => {
        const nameOk = request.query.name ? data.name === request.query.name : true;
        const categoryOk = request.query.category ? data.category === request.query.category : true;
        return nameOk && categoryOk;
      });
      response.status(200).json(filteredData);
    });
    return router;
  }

  /**
   * Method used to validate the data router endpoint query parameters
   * @param {Object} params The query parameters which should be validated
   * @returns an object with validation result (true/false) and an optional cause (if validation NOK)
   */
  #validateQueryParams(params) {
    const validator = new Ajv();
    const validate = validator.compile({
      type: "object",
      additionalProperties: false,
      properties: {
        owner: { type: "string" },
        name: { type: "string" },
        category: { type: "string" },
      },
      required: ["owner"],
    });
    return {
      valid: validate(params),
      cause: validate.errors,
    };
  }
}

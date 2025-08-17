import { AccessChecker } from "../../middleware/access-checker.js";

import Ajv from "ajv";
import express from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

export class DataRouter {
  #dataFileConfig = undefined;

  /**
   * Creates a new data router for configuring appropriate endpoints
   * @param {Object} dataFileConfig The object containing data file configuration
   */
  constructor(dataFileConfig) {
    this.#dataFileConfig = dataFileConfig;
  }

  /**
   * Method used to create routes for scraped data values
   * @returns router object for handling data requests
   */
  createRoutes() {
    const router = express.Router();
    // create endpoint for receiving data according specified query param filters
    router.get("/", AccessChecker.canReceiveData, (request, response) => {
      const validationResult = this.#validateQueryParams(request.query);
      if (!validationResult.valid) {
        response.status(400).json(validationResult.cause);
        return;
      }
      const token = request.headers["authorization"].split(" ")[1];
      const user = jwt.verify(token, process.env.JWT_SECRET);
      const userPath = path.join(this.#dataFileConfig.path, user.email, this.#dataFileConfig.file);
      if (!fs.existsSync(userPath)) {
        response.status(400).json(`Invalid data owner provided`);
        return;
      }
      var dataContent = JSON.parse(fs.readFileSync(userPath));
      var filteredData = dataContent.filter((data) => {
        const nameOk = request.query.name ? data.name === request.query.name : true;
        const categoryOk = request.query.category ? data.category === request.query.category : true;
        return nameOk && categoryOk;
      });
      if (request.query.item) {
        filteredData = filteredData
          .flatMap((data) => data.items)
          .filter((item) => {
            const directName = item.name === request.query.item;
            const namedId = item.name.toLowerCase().replace(/\s+/g, "-") === request.query.item;
            return directName || namedId;
          });
      }
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
        name: { type: "string" },
        category: { type: "string" },
        item: { type: "string" },
      },
    });
    return {
      valid: validate(params),
      cause: validate.errors,
    };
  }
}

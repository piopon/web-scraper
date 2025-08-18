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
    router.get("/", AccessChecker.canReceiveData, (request, response) => {
      this.#handleGetRequest(request, response, (dataContent) =>
        dataContent.filter((data) => {
          const nameOk = request.query.name ? data.name === request.query.name : true;
          const categoryOk = request.query.category ? data.category === request.query.category : true;
          return nameOk && categoryOk;
        })
      );
    });
    router.get("/items", AccessChecker.canReceiveData, (request, response) => {
      this.#handleGetRequest(request, response, (dataContent) => {
        var filteredData = dataContent.flatMap((data) => data.items);
        if (request.query.name) {
          filteredData = filteredData.filter((item) => {
            const directName = item.name === request.query.name;
            const namedId = item.name.toLowerCase().replace(/\s+/g, "-") === request.query.name;
            return directName || namedId;
          });
        }
        return filteredData;
      });
    });
    return router;
  }

  /**
   * Method containing common logic used to handle GET requests
   * @param {Object} request The incoming request object
   * @param {Object} response The outputted response object
   * @param {Function} filter The function using file data values to return appropriate data
   */
  #handleGetRequest(request, response, filter) {
    const validationResult = this.#validateQueryParams(request.url, request.query);
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
    response.status(200).json(filter(dataContent));
  }

  /**
   * Method used to validate the data router endpoint query parameters
   * @param {String} url The endpoint URL address (containing only the path)
   * @param {Object} params The query parameters which should be validated
   * @returns an object with validation result (true/false) and an optional cause (if validation NOK)
   */
  #validateQueryParams(url, params) {
    const validator = new Ajv();
    const urlProps = new Map([
      ["/", { name: { type: "string" }, category: { type: "string" } }],
      ["/items", { name: { type: "string" } }],
    ]).get(url.indexOf("?") > 0 ? url.substring(0, url.indexOf("?")) : url);
    const validate = validator.compile({
      type: "object",
      additionalProperties: false,
      properties: urlProps,
    });
    return {
      valid: validate(params),
      cause: validate.errors,
    };
  }
}

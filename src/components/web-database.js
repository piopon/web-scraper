import { ComponentStatus, ComponentType } from "../config/app-types.js";
import { ScrapConfig } from "../model/scrap-config.js";
import { ScrapUser } from "../model/scrap-user.js";
import { StatusLogger } from "./status-logger.js";

import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export class WebDatabase {
  static #COMPONENT_NAME = "web-database  ";

  #status = undefined;
  #config = undefined;

  /**
   * Creates a new web database from the specified configuration
   * @param {Object} config The object containing database configuration values
   */
  constructor(config) {
    this.#config = config;
    this.#status = new StatusLogger(WebDatabase.#COMPONENT_NAME, config.minLogLevel);
    this.#status.info("Created");
  }

  /**
   * Method used to start database connection
   */
  async start() {
    try {
      const dbConfig = this.#config.databaseConfig;
      const dbUrl = `mongodb://${dbConfig.url}:${dbConfig.port}`;
      const dbOptions = {
        appName: dbConfig.name,
        dbName: dbConfig.name,
        user: dbConfig.user,
        pass: dbConfig.password,
        serverSelectionTimeoutMS: dbConfig.timeout,
        connectTimeoutMS: dbConfig.timeout,
        family: 4,
      };
      await mongoose.connect(dbUrl, dbOptions);
      this.#status.info("Connected to database");
      await this.#doMaintenance();
      return true;
    } catch (error) {
      this.#status.error(error.message);
      return false;
    }
  }

  /**
   * Method used to stop database operations and disconnect
   */
  async stop() {
    mongoose.disconnect();
  }

  /**
   * Method used to get current web database component working status
   * @returns web database component status
   */
  getStatus() {
    if (1 === mongoose.connection.readyState) {
      return ComponentStatus.RUNNING;
    } else if (2 === mongoose.connection.readyState) {
      return ComponentStatus.INITIALIZING;
    } else {
      return ComponentStatus.STOPPED;
    }
  }

  /**
   * Method used to return the name of the component
   * @returns web database component name
   */
  getName() {
    return WebDatabase.#COMPONENT_NAME;
  }

  /**
   * Method used to receive additional info components
   * @returns an object with extra info: component type and require pass flag
   */
  getInfo() {
    return { types: [ComponentType.INIT], initWait: true };
  }

  /**
   * Method used to receive running history status of web database
   * @returns array of objects containing web database running history status
   */
  getHistory() {
    return this.#status.getHistory();
  }

  /**
   * Method used to perform database maintenance operations after successfull connect
   */
  async #doMaintenance() {
    if (!await this.#hasUserWithEmail(process.env.DEMO_BASE)) {
      await this.#createBaseDemoUser();
    }
    if (!await this.#hasUserWithEmail(process.env.CI_USER)) {
      await this.#createCiUser();
    }
    const usersCleaned = await this.#cleanDemoUsers();
    const configsCleaned = await this.#cleanUnusedConfigs();
    this.#status.info(`Maintenance summary: ${configsCleaned} configs, ${usersCleaned} demos`);
  }

  /**
   * Method used to check if a specified email is present in database
   * @param {String} email The e-mail which presence we want to check
   * @returns true if specified email is present in database, false otherwise
   */
  async #hasUserWithEmail(email) {
    return await ScrapUser.getDatabaseModel().findOne({ email: email }) != null;
  }

  async #createBaseDemoUser() {
      const demoUser = {
        name: "demo",
        email: process.env.DEMO_BASE,
        password: bcrypt.hashSync(process.env.DEMO_PASS, this.#config.authConfig.hashSalt),
      };
      const configFile = path.join(this.#config.jsonDataConfig.path, this.#config.jsonDataConfig.config);
      const demoConfig = JSON.parse(fs.readFileSync(configFile));
      await this.#createUserWithConfig(demoUser, demoConfig);
      this.#status.info(`Base demo user not found... Created new one!`);
  }

  async #createCiUser() {
      const ciUser = {
        name: "bruno",
        email: process.env.CI_USER,
        password: bcrypt.hashSync(process.env.CI_PASS, this.#config.authConfig.hashSalt),
      };
      const configFile = path.join(this.#config.jsonDataConfig.path, this.#config.jsonDataConfig.config);
      const ciConfig = JSON.parse(fs.readFileSync(configFile));
      const ciDataPath = path.join(this.#config.usersDataConfig.path, process.env.CI_USER);
      if (!fs.existsSync(ciDataPath)) {
        fs.mkdirSync(ciDataPath, { recursive: true });
        const dataSrc = path.join(this.#config.jsonDataConfig.path, this.#config.jsonDataConfig.data);
        const dataDst = path.join(ciDataPath, this.#config.jsonDataConfig.data);
        fs.copyFileSync(dataSrc, dataDst);
        await this.#createUserWithConfig(ciUser, ciConfig);
      }
      this.#status.info(`CI user not found... Created new one!`);
  }

  /**
   * Method use to create a new user and config entries in database
   * @param {Object} user An object representing user which we want to save in database
   * @param {Object} config An object representing config which we want to save in database
   */
  async #createUserWithConfig(user, config) {
    const createdUser = await ScrapUser.getDatabaseModel().create(user);
    const createdConfig = await ScrapConfig.getDatabaseModel().create(config);
    createdUser.config = createdConfig._id;
    await createdUser.save();
    createdConfig.user = createdUser._id;
    await createdConfig.save();
  }

  /**
   * Method used to cleanup all demo users (which are just temporary)
   * @returns number of demo session users removed
   */
  async #cleanDemoUsers() {
    const result = await ScrapUser.getDatabaseModel().deleteMany({ hostUser: { $ne: null } });
    return result.deletedCount;
  }

  /**
   * Method used to cleanup all unused configs (which users do not exist anymore)
   * @returns number of unused scraper configurations removed
   */
  async #cleanUnusedConfigs() {
    const usersCount = await ScrapUser.getDatabaseModel().countDocuments();
    const configsCount = await ScrapConfig.getDatabaseModel().countDocuments();
    const toDelete = configsCount - usersCount;
    if (toDelete < 0) {
      throw new Error("Invalid state! There is an user without a config...");
    }
    if (toDelete > 0) {
      const users = await ScrapUser.getDatabaseModel().find();
      const usersIds = users.map((user) => user._id);
      const result = await ScrapConfig.getDatabaseModel().deleteMany({ user: { $not: { $in: usersIds } } });
      if (result.deletedCount != toDelete) {
        throw new Error("Invalid state! Inconsistent number of deleted configs...");
      }
    }
    return toDelete;
  }
}

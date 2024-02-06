import { ComponentType } from "../../config/app-types.js";
import { RegexUtils } from "../utils/regex-utils.js";
import { ScrapConfig } from "../model/scrap-config.js";
import { ScrapWarning } from "../model/scrap-exception.js";
import { ScrapValidator } from "../model/scrap-validator.js";
import { StatusLogger } from "./status-logger.js";
import { TimeoutError } from "puppeteer";

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export class WebScraper {
  static #COMPONENT_NAME = "web-scraper ";
  static #RUNNING_STATUS = "Running";

  #setupConfig = undefined;
  #waitConfig = new Map();
  #sessions = new Map();
  #status = undefined;

  /**
   * Creates a new web scraper with specified configuration
   * @param {Object} config The object containing scraper configuration
   */
  constructor(config) {
    this.#setupConfig = config;
    this.#status = new StatusLogger(WebScraper.#COMPONENT_NAME, config.minLogLevel);
    this.#status.info("Created");
  }

  /**
   * Method used to start web scraping action for specified user
   * @param {Object} sessionUser The user for which we want to start scrap process
   * @returns true if scraper started successfully, false otherwise
   */
  async start(sessionUser) {
    if (sessionUser == null) {
      this.#status.error(`Invalid scrap user: ${sessionUser}`);
      return false;
    }
    const session = {
      id: undefined,
      active: false,
      config: undefined,
      browser: undefined,
      page: undefined,
    };
    this.#status.info(`Reading configuration for user ${sessionUser.name}`);
    try {
      var configCandidate = await ScrapConfig.getDatabaseModel().findById(sessionUser.config);
      if (configCandidate == null) {
        this.#status.warning("User has no configuration. Start aborted.");
        return false;
      }
      session.config = new ScrapValidator(new ScrapConfig(configCandidate.toJSON())).validate();
    } catch (error) {
      if (error instanceof ScrapWarning) {
        session.config = configCandidate;
        this.#status.warning(error.message);
      } else {
        this.#status.error(`Invalid scrap configuration: ${error.message}`);
        return false;
      }
    }
    this.#status.info("Initializing virtual browser");
    // open new Puppeteer virtual browser and an initial web page
    session.browser = await puppeteer.launch({ headless: "new" });
    session.page = await session.browser.newPage();
    session.page.setDefaultTimeout(this.#setupConfig.scraperConfig.defaultTimeout);
    // invoke scrap data action initially and setup interval calls
    this.#status.info(`Starting data scraping for user ${sessionUser.name}`);
    const intervalTime = this.#setupConfig.scraperConfig.scrapInterval;
    session.id = setInterval(() => this.#scrapData(session), intervalTime);
    // store this session into active sessions map
    this.#sessions.set(sessionUser.email, session);
    this.#status.info(`${WebScraper.#RUNNING_STATUS} (every: ${intervalTime / 1000} seconds)`);
    return true;
  }

  /**
   * Method used to stop web scraping action
   * @param {Object} sessionUser The user for which we want to stop scraper
   * @param {String} reason The message with a web scraper stop reason. Non-empty value is treated as error.
   */
  async stop(sessionUser, reason = "") {
    const session = this.#sessions.get(sessionUser);
    if (session == null) {
      this.#status.error("Invalid internal state: session not started");
      return;
    }
    // stop running method in constant time intervals
    if (session.id != null) {
      clearInterval(session.id);
      session.id = undefined;
    }
    // update scraper status
    if (reason.length === 0) {
      this.#status.info("Stopped");
    } else if (reason !== this.#status.getStatus().message) {
      this.#status.error(reason);
    }
    // update internal object state
    session.active = false;
    // close currently opened page and browser
    try {
      if (session.page != null) {
        await session.page.close();
      }
      if (session.browser != null) {
        await session.browser.close();
      }
    } catch (warning) {
      this.#status.warning(`Stop issue: ${warning.message}`);
    }
    // remove entry from the sessions map
    this.#sessions.delete(sessionUser);
  }

  async update(sessionUser, scraperConfig) {
    const session = this.#sessions.get(sessionUser.email);
    if (session == null) {
      this.#status.error("Invalid internal state: session not started");
      return;
    }
    this.#waitConfig.set(session.id, scraperConfig);
  }

  /**
   * Method used to return the name of the component
   * @returns web scraper component name
   */
  getName() {
    return WebScraper.#COMPONENT_NAME;
  }

  /**
   * Method used to receive additional info components
   * @returns an object with extra info: component type and require pass flag
   */
  getInfo() {
    return { types: [ComponentType.INIT, ComponentType.CONFIG], mustPass: true };
  }

  /**
   * Method used to determine if the web scraper component is running (alive) or not
   * @param {Object} sessionUser The user for which we want to check scraper alive status
   * @returns true when web scraper is running, false otherwise
   */
  isAlive(sessionUser) {
    const session = this.#sessions.get(sessionUser.email);
    return session == null ? false : session.id != null;
  }

  /**
   * Method used to receive running history status of web scraper
   * @param {Object} sessionUser The user for which we want to get all status history
   * @returns array of objects containing web scraper running history status
   */
  getStatusHistory(sessionUser) {
    const invalidStateMessage = "Invalid internal state";
    const currentStatus = this.#status.getStatus().message;
    const session = this.#sessions.get(sessionUser.email);
    if (session != null) {
      if (session.id == null) {
        // scraper is NOT running in selected intervals
        if (currentStatus.startsWith(WebScraper.#RUNNING_STATUS)) {
          // incorrect state - update field
          this.#status.error(invalidStateMessage);
        }
      } else {
        // scraper is running in selected intervals
        if (!currentStatus.startsWith(WebScraper.#RUNNING_STATUS)) {
          // incorrect state - since it's running then we must stop it
          this.stop(sessionUser.email, invalidStateMessage);
        }
      }
    }
    return this.#status.getHistory();
  }

  /**
   * Method containing core web scraping logic (according to scrap user settings)
   * @param {Object} session The session values/settings used for scraping data
   * @returns true if scrap logic completed with no errors, false otherwise
   */
  async #scrapData(session) {
    if (session.config == null) {
      this.#status.error(`Invalid internal state: Missing scrap configuration`);
      return false;
    }
    if (session.active) {
      this.#status.warning("Skipping current scrap iteration - previous one in progress");
      return false;
    }
    // check if there is an updated version of current session config
    const updatedConfig = this.#waitConfig.get(session.id);
    if (updatedConfig != null) {
      session.config = updatedConfig;
      this.#waitConfig.delete(session.id);
    }
    const data = [];
    session.active = true;
    for (let groupIndex = 0; groupIndex < session.config.groups.length; groupIndex++) {
      const group = session.config.groups[groupIndex];
      const groupObject = { name: group.name, category: group.category, items: [] };
      for (let observerIndex = 0; observerIndex < group.observers.length; observerIndex++) {
        const observer = group.observers[observerIndex];
        try {
          const pageUrl = new URL(observer.path, group.domain);
          await this.#navigateToPage(session.page, pageUrl, observer);
          const dataObj = await session.page.evaluate((observer) => {
            try {
              // try to get data container
              const dataContainer = document.querySelector(observer.container);
              if (dataContainer == null) {
                throw new Error("Cannot find data container");
              }
              // define data getter function
              const getData = (selector, attribute, auxiliary) => {
                if (selector && attribute) {
                  const component = Object.keys(observer).filter((key) => observer[key].selector === selector);
                  const element = dataContainer.querySelector(selector);
                  if (element == null) {
                    throw new Error(`Cannot find ${component} element of ${observer.path}`);
                  }
                  const value = element[attribute];
                  if (value == null) {
                    throw new Error(`Cannot find ${component} value of ${observer.path}`);
                  }
                  return value;
                }
                return auxiliary;
              };
              // return an object with collected data
              return {
                status: "OK",
                name: getData(observer.title.selector, observer.title.attribute, observer.title.auxiliary),
                icon: getData(observer.image.selector, observer.image.attribute, observer.image.auxiliary),
                price: getData(observer.price.selector, observer.price.attribute),
                currency: observer.price.auxiliary,
              };
            } catch (error) {
              return { err: error.message };
            }
          }, observer);
          const validationResult = this.#validateData(dataObj);
          if (validationResult.length > 0) {
            throw new Error(validationResult);
          }
          groupObject.items.push(this.#formatData(dataObj));
        } catch (error) {
          groupObject.items.push({
            status: "ERROR",
            name: observer.name,
            reason: error.message,
          });
          this.#status.warning(`Cannot get data - observer ${observer.name} (group ${group.name}): ${error.message}`);
        }
      }
      data.push(groupObject);
    }
    this.#saveData(data);
    session.active = false;
    return true;
  }

  /**
   * Method used to go to a specified URL and wait until an observer selector is available
   * @param {Object} sessionPage The session page object which should be updated
   * @param {String} newUrl The new URL address to navigate to
   * @param {Object} observer The observer which has the selector definition to find on a page
   */
  async #navigateToPage(sessionPage, newUrl, observer) {
    let attempt = 1;
    let foundSelector = false;
    const maxAttempts = this.#setupConfig.scraperConfig.timeoutAttempts;
    while (!foundSelector) {
      try {
        await sessionPage.goto(newUrl, { waitUntil: observer.target });
        await sessionPage.waitForSelector(observer.price.selector, { visible: true });
        foundSelector = true;
      } catch (error) {
        if (attempt <= maxAttempts && error instanceof TimeoutError) {
          this.#status.warning(`Timeout when waiting for: ${observer.price.selector} [${attempt}/${maxAttempts}]`);
          attempt++;
          continue;
        }
        this.#status.warning(`Exceeded the maximum number of retries: ${maxAttempts}`);
        await this.#createErrorScreenshot(sessionPage, this.#status.getStatus());
        throw new Error(`Cannot find price element in page ${newUrl}`);
      }
    }
  }

  /**
   * Method used to save specified object in a destination file (its path stored in configuration object)
   * @param {Object} dataToSave The data object to save in destination file
   */
  #saveData(dataToSave) {
    const dataDirectory = path.dirname(this.#setupConfig.dataOutputPath);
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    fs.writeFileSync(this.#setupConfig.dataOutputPath, JSON.stringify(dataToSave, null, 2));
  }

  /**
   * Method used to format data in the specified data object
   * @param {Object} dataObj The object which we want to format
   * @returns formatted object
   */
  #formatData(dataObj) {
    // assure that price attribute contains only value with dot
    dataObj.price = RegexUtils.getPrices(dataObj.price)[0];
    return dataObj;
  }

  /**
   * Method used to validate data in the specified data object
   * @param {Object} dataObj The object which we want to validate
   * @returns empty string if passed object is valid, non-empty string otherwise
   */
  #validateData(dataObj) {
    if (dataObj.err != null) {
      return `Incorrect scrap configuration: ${dataObj.err}`;
    }
    const objectName = dataObj.name ? dataObj.name : "[unnamed]";
    if (dataObj.price == null || dataObj.price.length === 0) {
      return `Invalid scraped data: Missing price value for ${objectName}`;
    }
    const priceParsed = RegexUtils.getPrices(dataObj.price);
    if (priceParsed == null || priceParsed.length !== 1) {
      return `Invalid scraped data: Incorrect price value for ${objectName}`;
    }
    return "";
  }

  /**
   * Method used to create an error screenshot of current web page (if present)
   * @param {Object} sessionPage The session page object for which to take the screenshot
   * @param {Object} error The occured error object
   */
  async #createErrorScreenshot(sessionPage, error) {
    if (sessionPage && error.type.length > 0) {
      if (!fs.existsSync(this.#setupConfig.screenshotPath)) {
        fs.mkdirSync(this.#setupConfig.screenshotPath, { recursive: true });
      }
      const screenshotName = `error_${error.timestamp.replaceAll(":", "-").replaceAll(" ", "_")}.png`;
      const screenshotPath = path.join(this.#setupConfig.screenshotPath, screenshotName);
      await sessionPage.screenshot({ path: screenshotPath });
    }
  }
}

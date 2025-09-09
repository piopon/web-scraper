import { CommonController } from "./controller-common.js";
import { SettingsService } from "./service-settings.js";

export class SettingsController {
  /**
   * Creates settings controller which initializes data and binds all listeners
   */
  constructor() {
    this.#initController();
  }

  /**
   * Method to initialize controller and set starting UI values, bind listeners, etc.
   */
  #initController() {
    const importApply = document.querySelector("input.config-import-apply");
    if (importApply) {
      importApply.disabled = true;
    }
    this.#bindListeners();
  }

  /**
   * Method used to bind all UI widget listeners with controller methods
   */
  #bindListeners() {
    document.querySelectorAll("input.config-export-apply").forEach((button) => {
      button.addEventListener("click", (_) => this.#exportConfigToFileHandler());
    });
    document.querySelectorAll("input.config-import-file").forEach((selector) => {
      selector.addEventListener("change", this.#changeImportConfigFileHandler);
    });
    document.querySelectorAll("input.config-import-button").forEach((button) => {
      button.addEventListener("click", this.#selectImportConfigFileHandler);
    });
    document.querySelectorAll("input.config-import-apply").forEach((button) => {
      button.addEventListener("click", this.#applyImportConfigFileHandler);
    });
  }

  /**
   * Handler controlling export configuration button behavior
   * @note: This method shows save dialog and saves current user's config to JSON file
   */
  async #exportConfigToFileHandler() {
    const configBlob = await this.#getConfigFileBlob();
    const fileHandle = await window.showSaveFilePicker({
      types: [{ accept: { "application/json": [".json"] } }],
    });
    const writeFileStream = await fileHandle.createWritable();
    await writeFileStream.write(configBlob);
    await writeFileStream.close();
  }

  /**
   * Handler controlling (invisible for the user) file selector input behavior
   * @param {Event} event The inner data initialized with input event
   */
  #changeImportConfigFileHandler(event) {
    if (event.target.files[0]) {
      const fileButton = event.target.nextElementSibling;
      fileButton.value = event.target.files[0].name;
      event.target.nextElementSibling.nextElementSibling.disabled = false;
    }
  }

  /**
   * Handler controlling (visible for the user) import config file button behavior
   * @note: Underneath it invokes file selector behavior by simulating click/change action
   * @param {Event} event The inner data initialized with button event
   */
  #selectImportConfigFileHandler(event) {
    event.target.previousElementSibling.click();
    event.stopPropagation();
  }

  /**
   * Handler controlling import config file apply button behavior
   * @param {Event} event The inner data initialized with button event
   */
  #applyImportConfigFileHandler(event) {
    const fileInput = event.target.previousElementSibling.previousElementSibling;
    SettingsService.importConfig(fileInput)
      .then((data) => CommonController.showToastSuccess(data))
      .catch((error) => CommonController.showToastError(error));
  }

  /**
   * Method used to retrieve the blob with scraper configuration content
   * @returns JSON blob containing scraper configuration to be exported
   */
  async #getConfigFileBlob() {
    const config = await SettingsService.getConfig();
    // remove unwanted DB properties (_id, __v, etc.)
    const raw = this.#propsOmitter(config, ["_id", "__v"]);
    return new Blob([JSON.stringify(raw)], { type: "application/json" });
  }

  /**
   * Method used to remove the specified keys from the input object
   * @param {Object} obj The object from which we want to remove the specified keys
   * @param {Array} keysToOmit The array with keys to be removed from the object
   * @returns The object without the keys specified in the input
   */
  #propsOmitter(obj, keysToOmit) {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.#propsOmitter(item, keysToOmit));
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        if (!keysToOmit.includes(key)) {
          acc[key] = this.#propsOmitter(obj[key], keysToOmit);
        }
        return acc;
      }, {});
    }
    return obj;
  }
}

import { CommonController } from "./controller-common.js";
import { SettingsService } from "./service-settings.js";

export class SettingsController {
  constructor() {
    this.#initController();
  }

  #initController() {
    const importApply = document.querySelector("input.config-import-apply");
    if (importApply) {
      importApply.disabled = true;
    }
    this.#bindListeners();
  }

  #bindListeners() {
    document.querySelectorAll("input.config-export-apply").forEach((button) => {
      button.addEventListener("click", this.#exportConfigToFileHandler);
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

  async #exportConfigToFileHandler() {
    const configBlob = await this.#getConfigFileBlob();
    const fileHandle = await window.showSaveFilePicker({
      types: [{ accept: { "application/json": [".json"] } }],
    });
    const writeFileStream = await fileHandle.createWritable();
    await writeFileStream.write(configBlob);
    await writeFileStream.close();
  }

  #changeImportConfigFileHandler(event) {
    if (event.target.files[0]) {
      const fileButton = event.target.nextElementSibling;
      fileButton.value = event.target.files[0].name;
      event.target.nextElementSibling.nextElementSibling.disabled = false;
    }
  }

  #selectImportConfigFileHandler(event) {
    event.target.previousElementSibling.click();
    event.stopPropagation();
  }

  #applyImportConfigFileHandler(event) {
    const fileInput = event.target.previousElementSibling.previousElementSibling;
    SettingsService.importConfig(fileInput)
      .then((data) => CommonController.showToastSuccess(data))
      .catch((error) => CommonController.showToastError(error));
  }

  async #getConfigFileBlob() {
    const config = await SettingsService.getConfig();
    return new Blob([config], { type: "application/json" });
  }
}

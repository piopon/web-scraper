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
      button.addEventListener("click", console.log("EXPORT APPLIED"));
    });
    document.querySelectorAll("input.config-import-file").forEach((selector) => {
      selector.addEventListener("change", this.#changeImportConfigFileHandler);
    });
    document.querySelectorAll("input.config-import-button").forEach((button) => {
      button.addEventListener("click", this.#selectImportConfigFileHandler);
    });
    document.querySelectorAll("input.config-import-apply").forEach((button) => {
      button.addEventListener("click", console.log("IMPORT APPLIED"));
    });
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
}

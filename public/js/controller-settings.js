export class SettingsController {
  constructor() {
    this.#bindListeners();
  }

  #bindListeners() {
    document.querySelectorAll("input.config-export-apply").forEach((button) => {
      button.addEventListener("click", console.log("EXPORT APPLIED"));
    });
    document.querySelectorAll("input.config-import-file").forEach((selector) => {
      selector.addEventListener("change", console.log("FILE CHANGED"));
    });
    document.querySelectorAll("input.config-import-button").forEach((button) => {
      button.addEventListener("click", console.log("FILE INVOKED"));
    });
    document.querySelectorAll("input.config-import-apply").forEach((button) => {
      button.addEventListener("click", console.log("IMPORT APPLIED"));
    });
  }
}

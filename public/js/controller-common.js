export class CommonController {
  static #TOAST_TIMEOUT_MS = 6000;
  static #TYPE_ERROR = -1;
  static #TYPE_SUCCESS = 0;
  static #TYPE_WARNING = 1;

  static showToast(type, message) {
    const toastBox = document.getElementById("toastBox");
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerHTML = `<i class="fa-solid ${this.#getToastIcon(type)}"></i> ${message}`;
    toastBox.appendChild(toast);

    if (this.#TYPE_ERROR === type) {
      toast.classList.add("error");
    }
    if (this.#TYPE_SUCCESS === type) {
      toast.classList.add("success");
    }
    if (this.#TYPE_WARNING === type) {
      toast.classList.add("warning");
    }
    setTimeout(() => toast.remove(), this.#TOAST_TIMEOUT_MS);
  }

  static #getToastIcon(toastType) {
    if (this.#TYPE_ERROR === toastType) {
      return "fa-circle-xmark";
    } else if (this.#TYPE_WARNING === toastType) {
      return "fa-circle-exclamation";
    } else if (this.#TYPE_SUCCESS === toastType) {
      return "fa-circle-check";
    } else {
      console.error(`Unknown toast type: ${toastType}`);
    }
  }
}

export class CommonController {
  static #TOAST_TIMEOUT_MS = 6000;
  static #TYPE_ERROR = -1;
  static #TYPE_SUCCESS = 0;
  static #TYPE_WARNING = 1;

  static showToastError(message) {
    this.#showToast(this.#TYPE_ERROR, message);
  }

  static showToastWarning(message) {
    this.#showToast(this.#TYPE_WARNING, message);
  }

  static showToastSuccess(message) {
    this.#showToast(this.#TYPE_SUCCESS, message);
  }

  static #showToast(type, message) {
    // create toast content
    const toastContent = document.createElement("div");
    toastContent.classList.add("toast");
    toastContent.classList.add(this.#getToastClass(type));
    toastContent.innerHTML = `${this.#getToastIcon(type)} ${message}`;
    // add toast content to appropriate container
    document.getElementById("toastBox").appendChild(toastContent);
    // remove toast content after predefined time
    setTimeout(() => toast.remove(), this.#TOAST_TIMEOUT_MS);
  }

  static #getToastClass(toastType) {
    if (this.#TYPE_ERROR === toastType) {
      return "error";
    } else if (this.#TYPE_WARNING === toastType) {
      return "warning";
    } else if (this.#TYPE_SUCCESS === toastType) {
      return "success";
    } else {
      console.error(`Unknown toast type: ${toastType}`);
    }
  }

  static #getToastIcon(toastType) {
    let toastImage = "";
    if (this.#TYPE_ERROR === toastType) {
      toastImage = "fa-circle-xmark";
    } else if (this.#TYPE_WARNING === toastType) {
      toastImage = "fa-circle-exclamation";
    } else if (this.#TYPE_SUCCESS === toastType) {
      toastImage = "fa-circle-check";
    } else {
      console.error(`Unknown toast type: ${toastType}`);
    }
    return `<i class="fa-solid ${toastImage}"></i>`;
  }
}

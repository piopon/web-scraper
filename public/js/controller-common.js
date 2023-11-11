export class CommonController {
  static #TYPE_ERROR = -1;
  static #TYPE_SUCCESS = 0;
  static #TYPE_WARNING = 1;

  static showToast(message) {
    const toastBox = document.getElementById("toastBox");
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerHTML = `<i class="fa-solid fa-circle-xmark}"></i> ${message}`;
    toastBox.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 6000);
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

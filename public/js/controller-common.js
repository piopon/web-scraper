export class CommonController {
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
}

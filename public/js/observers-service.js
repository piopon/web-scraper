export class ObserversService {
  static updateObserver(observerId) {
    fetch(`api/v1/configs/groups/observers?path=${observerId}`, this.#createSetRequestOptions("PUT"))
      .then((response) => response.text())
      .then((data) => console.log(data))
      .catch((error) => console.log(error));
  }

  static #createObserver() {
    return {};
  }

  static #createSetRequestOptions(method) {
    return {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: this.#createObserver(),
    };
  }
}

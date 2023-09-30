export class ObserversService {
  static async updateObserver(observerId) {
    const url = `api/v1/configs/groups/observers?path=${observerId}`;
    const response = await fetch(url, this.#createSetRequestOptions("PUT"));
    if (response.status === 200) {
      return response.text();
    }
    throw new Error(`Cannot update observer ${observerId}`);
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

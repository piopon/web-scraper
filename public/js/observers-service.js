export class ObserversService {
  static updateObserver(observerId) {
    fetch(`api/v1/configs/groups`)
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.log(error));
  }
}

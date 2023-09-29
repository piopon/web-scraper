export class ObserversService {
  updateObserver(observerId, newObserver) {
    fetch(`localhost:5000/api/v1/configs/groups/observers?path=${observerId}`)
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
  }
}

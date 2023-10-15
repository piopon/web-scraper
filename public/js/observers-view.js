export class ObserversView {

    static getHTML = function (observers) {
        observers.forEach(observer => {
            ObserversView.#getExistingObserverHtml(observer);
        });
        ObserversView.#getNewObserverHtml();
    }

    static #getExistingObserverHtml(observer) {
        console.log(observer);
    }

    static #getNewObserverHtml() {
        console.log("new observer button");
    }
}
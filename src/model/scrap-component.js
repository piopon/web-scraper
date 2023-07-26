export class ScrapComponent {
    #interval;
    #selector;
    #attribute;

    constructor(object) {
        object = object != null ? object : {};
        this.#interval = object.interval != null ? object.interval : "";
        this.#selector = object.selector != null ? object.selector : "";
        this.#attribute = object.attribute != null ? object.attribute : "";
    }

    getInterval() {
        return this.#interval;
    }

    getSelector() {
        return this.#selector;
    }

    getAttribute() {
        return this.#attribute;
    }
}
import { ScrapObserver } from "./scrap-observer.js";
import { getArrayOfModels } from '../components/model-utils.js'

export class ScrapGroup {
    #name;
    #domain;
    #observers;

    constructor(object) {
        object = object != null ? object : {};
        this.#name = object.name != null ? object.name : "";
        this.#domain = object.domain != null ? object.domain : "";
        this.#observers = getArrayOfModels(ScrapObserver, object.observers);
    }

    getName() {
        return this.#name;
    }

    getDomain() {
        return this.#domain;
    }

    getObservers() {
        return this.#observers;
    }
}
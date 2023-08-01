import { ScrapObserver } from "./scrap-observer.js";
import { getArrayOfModels } from '../components/model-utils.js'

export class ScrapGroup {
    constructor(object) {
        const input = object != null ? object : {};
        this.name = input.name != null ? input.name : "";
        this.category = input.category != null ? input.category : "";
        this.domain = input.domain != null ? input.domain : "";
        this.observers = getArrayOfModels(ScrapObserver, input.observers);
    }
}
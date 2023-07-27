import { ScrapGroup } from "./scrap-group.js";
import { getArrayOfModels } from '../components/model-utils.js'

export class ScrapConfig {
    #groups;

    constructor(object) {
        object = object != null ? object : {};
        this.#groups = getArrayOfModels(ScrapGroup, object);
    }

    getGroups() {
        return this.#groups;
    }
}
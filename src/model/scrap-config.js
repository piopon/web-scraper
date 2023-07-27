import { ScrapGroup } from "./scrap-group";
import { getArrayOfModels } from '../components/model-utils'

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
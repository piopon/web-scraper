import { ScrapGroup } from "./scrap-group.js";
import { getArrayOfModels } from '../components/model-utils.js'

export class ScrapConfig {
    constructor(object) {
        object = object != null ? object : {};
        this.user = object.user != null ? object.user : "";
        this.groups = getArrayOfModels(ScrapGroup, object.groups);
    }
}
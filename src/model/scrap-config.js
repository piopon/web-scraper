import { ScrapGroup } from "./scrap-group.js";
import { getArrayOfModels } from "../utils/model-utils.js";

export class ScrapConfig {
  constructor(object) {
    const input = object != null ? object : {};
    this.user = input.user != null ? input.user : "";
    this.groups = getArrayOfModels(ScrapGroup, input.groups);
  }
}

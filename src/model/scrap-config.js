import { ModelUtils } from "../utils/model-utils.js";
import { ScrapGroup } from "./scrap-group.js";

export class ScrapConfig {
  constructor(object) {
    const input = object != null ? object : {};
    this.user = input.user != null ? input.user : "";
    this.groups = ModelUtils.getArrayOfModels(ScrapGroup, input.groups);
  }
}

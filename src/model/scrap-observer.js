import { ScrapComponent } from "./scrap-component.js";

export class ScrapObserver {
    constructor(object) {
        object = object != null ? object : {};
        this.path = object.path != null ? object.path : "";
        this.history = object.history != null ? object.history : "";
        this.title = new ScrapComponent(object.title);
        this.image = new ScrapComponent(object.image);
        this.price = new ScrapComponent(object.price);
    }
}
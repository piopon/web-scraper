import { ScrapComponent } from "./scrap-component.js";

export class ScrapObserver {
    constructor(object) {
        const input = object != null ? object : {};
        this.path = input.path != null ? input.path : "";
        this.history = input.history != null ? input.history : "";
        this.container = input.container != null ? input.container : "";
        this.title = new ScrapComponent(input.title);
        this.image = new ScrapComponent(input.image);
        this.price = new ScrapComponent(input.price);
    }
}
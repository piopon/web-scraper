import { DataComponent } from "./data-component";

export class DataObserver {
    #path;
    #history;
    #title;
    #image;
    #price;

    constructor(object) {
        object = object != null ? object : {};
        this.#path = object.path != null ? object.path : "";
        this.#history = object.history != null ? object.history : "";
        this.#title = new DataComponent(object.title);
        this.#image = new DataComponent(object.image);
        this.#price = new DataComponent(object.price);
    }

    getPath() {
        return this.#path;
    }

    getHistory() {
        return this.#history;
    }

    getTitle() {
        return this.#title;
    }

    getImage() {
        return this.#image;
    }
    
    getPrice() {
        return this.#price;
    }
}
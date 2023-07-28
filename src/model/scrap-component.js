export class ScrapComponent {
    constructor(object) {
        object = object != null ? object : {};
        this.interval = object.interval != null ? object.interval : "";
        this.selector = object.selector != null ? object.selector : "";
        this.attribute = object.attribute != null ? object.attribute : "";
    }
}
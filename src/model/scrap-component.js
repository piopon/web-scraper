export class ScrapComponent {
  constructor(object) {
    const input = object != null ? object : {};
    this.interval = input.interval != null ? input.interval : "";
    this.selector = input.selector != null ? input.selector : "";
    this.attribute = input.attribute != null ? input.attribute : "";
    this.auxiliary = input.auxiliary != null ? input.auxiliary : "";
  }
}

export class LogLevel {
    static ERROR = new LogLevel(0);
    static WARNING = new LogLevel(1);
    static INFO = new LogLevel(2);
    static DEBUG = new LogLevel(3);

    // variables related to log level settings
    constructor(value) {
        this.value = value
    }
}
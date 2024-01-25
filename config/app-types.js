/**
 * Class representing the log level message
 * It implements an enum with values: ERROR, WARNING, INFO, DEBUG
 */
class LogLevel {
  static ERROR = new LogLevel(0);
  static WARNING = new LogLevel(1);
  static INFO = new LogLevel(2);
  static DEBUG = new LogLevel(3);

  /**
   * Creates an object representing log level setting
   * @param {Number} value The log level integer value
   */
  constructor(value) {
    this.value = value;
  }
}

/**
 * Class representing the web-server component typs
 * It implements an enum with values: INIT, LOGIN
 */
class ComponentType {
  static INIT = new ComponentType("init");
  static LOGIN = new ComponentType("login");

  /**
   * Creates an object representing component type setting
   * @param {String} name The component type name value
   */
  constructor(name) {
    this.name = name;
  }
}

export { LogLevel, ComponentType };

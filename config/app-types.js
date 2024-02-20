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
 * Class representing the web-server component type
 * It implements an enum with values: INIT, AUTH, CONFIG
 */
class ComponentType {
  static INIT = new ComponentType("init", ["start", "stop"]);
  static AUTH = new ComponentType("auth", ["start", "stop"]);
  static SLAVE = new ComponentType("slave", ["getMaster"]);
  static CONFIG = new ComponentType("config", ["update"]);

  /**
   * Creates an object representing component type setting
   * @param {String} name The component type name value
   * @param {Array} methods Required methods names for component type compability
   */
  constructor(name, methods) {
    this.name = name;
    this.methods = methods;
  }

  /**
   * Compares this component type with other one and determines if they are equal
   * @param {Object} other Another component type to compare
   * @returns true if checked component matches this one
   */
  equals(other) {
    return this.name === other.name;
  }
}

/**
 * Class representing the web-server component work status
 * It implements an enum with values: STOPPED, INITIALIZING, RUNNING
 */
class ComponentStatus {
  static STOPPED = new LogLevel("stopped");
  static INITIALIZING = new LogLevel("initializing");
  static RUNNING = new LogLevel("running");

  /**
   * Creates an object representing component working status
   * @param {String} state The component status value
   */
  constructor(state) {
    this.state = state;
  }

  /**
   * Compares this component status with other one and determines if they are equal
   * @param {Object} other Another component status object to compare
   * @returns true if checked component matches this one
   */
  equals(other) {
    return this.state === other.state;
  }
}

export { LogLevel, ComponentType, ComponentStatus };

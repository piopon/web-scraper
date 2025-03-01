/**
 * Class representing the log level message
 * It implements an enum with values: ERROR, WARNING, INFO, DEBUG
 */
class LogLevel {
  static ERROR = new LogLevel(0, "ERROR");
  static WARNING = new LogLevel(1, "WARNING");
  static INFO = new LogLevel(2, "INFO");
  static DEBUG = new LogLevel(3, "DEBUG");

  /**
   * Creates an object representing log level setting
   * @param {Number} value The log level integer value
   * @param {String} description The log level description
   */
  constructor(value, description) {
    this.value = value;
    this.description = description;
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
  static LOGOUT = new ComponentType("logout", ["stop", "clean"]);

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
    return this.name === other.name && this.methods.toString() === other.methods.toString();
  }
}

/**
 * Class representing the web-server component work status
 * It implements an enum with values: STOPPED, INITIALIZING, RUNNING
 */
class ComponentStatus {
  static STOPPED = new ComponentStatus("stopped");
  static INITIALIZING = new ComponentStatus("initializing");
  static RUNNING = new ComponentStatus("running");

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

/**
 * Class representing the demo session mode
 * It implements an enum with values: OVERWRITE, DUPLICATE
 */
class DemoMode {
  static OVERWRITE = new DemoMode("overwrite");
  static DUPLICATE = new DemoMode("duplicate");

  /**
   * Creates an object representing demo mode setting
   * @param {String} mode The demo mode value
   */
  constructor(mode) {
    this.mode = mode;
  }

  /**
   * Compares this demo modej with other one and determines if they are equal
   * @param {Object} other Another demo mode object to compare
   * @returns true if checked demo mode matches this one
   */
  equals(other) {
    return this.mode === other.mode;
  }
}

export { LogLevel, ComponentType, ComponentStatus, DemoMode };

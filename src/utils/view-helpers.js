function toArray(value, separator = "|") {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return [];
  }
  return value.split(separator);
}

export function createViewHelpers() {
  return {
    append: (...args) => args.slice(0, -1).join(""),
    and: (...args) => args.slice(0, -1).every(Boolean),
    or: (...args) => args.slice(0, -1).some(Boolean),
    eq: (left, right) => left === right,
    gt: (left, right) => left > right,
    length: (value) => value?.length ?? 0,
    unlessEq: (left, right) => left !== right,
    split: (value, separator) => toArray(value, separator),
    last: (value) => (Array.isArray(value) && value.length > 0 ? value[value.length - 1] : ""),
    contains: (value, text) => String(value ?? "").includes(String(text ?? "")),
    remove: (value, text) => String(value ?? "").split(String(text ?? "")).join(""),
    equalsLength: (value, expected) => (value?.length ?? 0) === expected,
  };
}

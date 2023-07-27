function getValueOrDefault(value, defaultValue) {
    return value == null ? defaultValue : value;
}

function getArray(items) {
  const objs = getValueOrDefault(items, []);
  return (Array.isArray(objs)) ? objs : [objs];
}

export function getArrayOfModels(Clazz, items) {
  const objs = getArray(items);
  let array = [];
  objs.forEach((obj) => {
    if (hasPropertyOf(Clazz, obj)) {
      array.push(new Clazz(obj));
    }
  });
  return array;
}

export function hasPropertyOf(Clazz, obj) {
  if (Clazz == null || obj == null) {
    return false;
  }
  const model = new Clazz();
  const modelKeys = Object.keys(model);
  for (let i = 0, keys = modelKeys; i < keys.length; i++) {
    const key = keys[i];
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return true;
    }
  }
  return false;
}

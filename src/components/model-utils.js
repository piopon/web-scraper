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

export function hasPropertyOf(clazz, obj) {
  const model = new clazz();
  const modelKeys = Object.keys(model);
  for (const key of modelKeys) {
    if (obj.hasOwnProperty(key)) {
      return true;
    }
  }
  return false;
}

export function getArray(objs) {
  objs = objs != null ? objs : [];
  let array = [];
  if (Array.isArray(objs)) {
    array = objs;
  } else {
    array = [objs];
  }
  return array;
}

export function getArrayOfModels(clazz, objs) {
  objs = ArrayUtils.getArray(objs);
  const array = [];
  for (const obj of objs) {
    if (ModelUtils.hasPropertyOf(clazz, obj)) {
      array.push(new clazz(obj));
    }
  }
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

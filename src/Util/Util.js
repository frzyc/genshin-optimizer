export const getRandomElementFromArray = (array) => array[Math.floor(Math.random() * array.length)];
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
export function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
}
export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
export const loadFromLocalStorage = (key) => {
  let data = localStorage.getItem(key)
  if (!data) return null
  return JSON.parse(data)
}
export const saveToLocalStorage = (key, obj) =>
  localStorage.setItem(key, JSON.stringify(obj));
export const deepClone = (obj) =>
  JSON.parse(JSON.stringify(obj))

export const closeEnoughFloat = (a, b) =>
  Math.abs(a - b) <= 0.101

export const closeEnoughInt = (a, b) =>
  Math.abs(a - b) <= 1
export const clamp = (val, low, high) => {
  if (val < low) return low;
  if (val > high) return high;
  return val
}
export const getArrLastElement = (arr) =>
  arr.length ? arr[arr.length - 1] : null

export const clamp01 = (val) => clamp(val, 0, 1)
export const clampPercent = (val) => clamp(val, 0, 100)

//use to pretty print timestamps, or anything really.
export function strPadLeft(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

//fuzzy compare strings. longer the distance, the higher the mismatch.
export function hammingDistance(str1, str2) {
  var dist = 0;
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  for (var i = 0, j = Math.max(str1.length, str2.length); i < j; i++) {
    let match = true
    if (!str1[i] || !str2[i] || str1[i] !== str2[i])
      match = false
    if (str1[i - 1] === str2[i] || str1[i + 1] === str2[i])
      match = true
    if (!match) dist++
  }
  return dist;
}

//multiplies every numberical value in the obj by a multiplier.
export function objMultiplication(obj, multi) {
  if (multi === 1) return obj
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === "object") objMultiplication(obj[prop], multi)
    if (typeof obj[prop] === "number") obj[prop] = obj[prop] * multi
  })
  return obj
}

//assign obj.[keys...] = value
export function layeredAssignment(obj, keys, value) {
  keys.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) return (accu[key] = value)
    if (!accu[key]) accu[key] = {}
    return accu[key]
  }, obj)
  return obj
}
export function objPathValue(obj, keys) {
  return keys.reduce((a, k) => a?.[k], obj)
}
//delete the value denoted by the path. Will also delete empty objects as well.
export function deletePropPath(obj, path) {
  const tempPath = [...path]
  const lastKey = tempPath.pop()
  const objPathed = objPathValue(obj, tempPath)
  delete objPathed[lastKey];
}

export function objClearEmpties(o) {
  for (const k in o) {
    if (typeof o[k] !== "object") continue
    objClearEmpties(o[k])
    if (!Object.keys(o[k]).length) delete o[k];
  }
}
export function getObjValueCount(o) {
  let count = 0
  for (const k in o) {
    if (typeof o[k] === "object") {
      count += getObjValueCount(o[k])
    } else count++
  }
  return count
}
export function crawlObject(obj, keys, validate, cb) {
  if (validate(obj)) cb(obj, keys)
  else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => crawlObject(val, [...keys, key], validate, cb))
}
// const getObjectKeysRecursive = (obj) => Object.values(obj).reduce((a, prop) => typeof prop === "object" ? [...a, ...getObjectKeysRecursive(prop)] : a, Object.keys(obj))
export const getObjectKeysRecursive = (obj) => typeof obj === "object" ? Object.values(obj).flatMap(getObjectKeysRecursive).concat(Object.keys(obj)) : (typeof obj === "string" ? [obj] : [])

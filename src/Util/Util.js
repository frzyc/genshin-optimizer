const getRandomElementFromArray = (array) => array[Math.floor(Math.random() * array.length)];
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
const loadFromLocalStorage = (key) => {
  let data = localStorage.getItem(key)
  if (!data) return null
  return JSON.parse(data)
}
const saveToLocalStorage = (key, obj) =>
  localStorage.setItem(key, JSON.stringify(obj));
const deepClone = (obj) =>
  JSON.parse(JSON.stringify(obj))

const closeEnoughFloat = (a, b) =>
  Math.abs(a - b) <= 0.101

const closeEnoughInt = (a, b) =>
  Math.abs(a - b) <= 1
const clamp = (val, low, high) => {
  if (val < low) return low;
  if (val > high) return high;
  return val
}
const getArrLastElement = (arr) =>
  arr.length ? arr[arr.length - 1] : null

const clamp01 = (val) => clamp(val, 0, 1)
const clampPercent = (val) => clamp(val, 0, 100)

//use to pretty print timestamps, or anything really.
function strPadLeft(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

//fuzzy compare strings. longer the distance, the higher the mismatch.
function hammingDistance(str1, str2) {
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
function objMultiplication(obj, multi) {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === "object") objMultiplication(obj[prop], multi)
    if (typeof obj[prop] === "number") obj[prop] = obj[prop] * multi
  })
}
// const getObjectKeysRecursive = (obj) => Object.values(obj).reduce((a, prop) => typeof prop === "object" ? [...a, ...getObjectKeysRecursive(prop)] : a, Object.keys(obj))
const getObjectKeysRecursive = (obj) => typeof obj === "object" ? Object.values(obj).flatMap(getObjectKeysRecursive).concat(Object.keys(obj)) : (typeof obj === "string" ? [obj] : [])
export {
  getRandomInt,
  getRandomIntInclusive,
  getRandomArbitrary,
  getRandomElementFromArray,
  loadFromLocalStorage,
  saveToLocalStorage,
  deepClone,
  closeEnoughFloat,
  closeEnoughInt,
  clamp,
  clamp01,
  clampPercent,
  getArrLastElement,
  strPadLeft,
  hammingDistance,
  objMultiplication,
  getObjectKeysRecursive
}
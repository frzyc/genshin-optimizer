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
  Math.abs(a - b) < 0.1

const closeEnoughInt = (a, b) =>
  Math.abs(a - b) <= 1
const clamp = (val, a, b) => {
  if (val < a) return a;
  if (val > b) return b;
  return val
}
const clamp01 = (val) => clamp(val, 0, 1)
const clampPercent = (val) => clamp(val, 0, 100)
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
  clampPercent
}
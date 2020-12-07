const getRandomElementFromArray = (array) => array[Math.floor(Math.random()*array.length)];
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
export {
  getRandomInt,
  getRandomIntInclusive,
  getRandomArbitrary,
  getRandomElementFromArray,
  loadFromLocalStorage,
  saveToLocalStorage
}
export const getRandomElementFromArray = <T>(array: readonly T[]): T =>
  array[Math.floor(Math.random() * array.length)]
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
}
export function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min) //The maximum is inclusive and the minimum is inclusive
}
export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function getRandBool() {
  return !Math.round(Math.random())
}

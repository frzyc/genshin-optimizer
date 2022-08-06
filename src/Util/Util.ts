export const getRandomElementFromArray = <T>(array: readonly T[]): T => array[Math.floor(Math.random() * array.length)];
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

/**
 * Assumes that the object entries are all primitives + objects
 * shallow copy the object,
 * deep copy the
 * @param obj
 * @returns
 */
export function deepClone<T>(obj: T): T {
  if (!obj) return obj
  if (!Object.keys(obj).length) return {} as T
  const ret = { ...obj }
  Object.entries(obj).forEach(([k, v]: any) => {
    if (typeof v !== "object") return
    ret[k] = JSON.parse(JSON.stringify(v))
  })
  return ret
}

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

//multiplies every numerical value in the obj by a multiplier.
export function objMultiplication(obj, multi) {
  if (multi === 1) return obj
  Object.keys(obj).forEach((prop: any) => {
    if (typeof obj[prop] === "object") objMultiplication(obj[prop], multi)
    if (typeof obj[prop] === "number") obj[prop] = obj[prop] * multi
  })
  return obj
}

//assign obj.[keys...] = value
export function layeredAssignment(obj, keys: readonly string[], value) {
  keys.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) return (accu[key] = value)
    if (!accu[key]) accu[key] = {}
    return accu[key]
  }, obj)
  return obj
}
//get the value in a nested object, giving array of path
export function objPathValue(obj: object | undefined, keys: readonly string[]): any {
  if (!obj || !keys) return undefined;
  !Array.isArray(keys) && console.error(keys)
  return keys.reduce((a, k) => a?.[k], obj)
}
//delete the value denoted by the path. Will also delete empty objects as well.
export function deletePropPath(obj, path) {
  const tempPath = [...path]
  const lastKey = tempPath.pop()
  const objPathed = objPathValue(obj, tempPath)
  delete objPathed?.[lastKey];
}

export function objClearEmpties(o) {
  for (const k in o) {
    if (typeof o[k] !== "object") continue
    objClearEmpties(o[k])
    if (!Object.keys(o[k]).length) delete o[k];
  }
}
export function crawlObject(obj: any, keys: string[] = [], validate: (o: any, keys: string[]) => boolean, cb: (o: any, keys: string[]) => void) {
  if (validate(obj, keys)) cb(obj, keys)
  else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => crawlObject(val, [...keys, key], validate, cb))
}
// const getObjectKeysRecursive = (obj) => Object.values(obj).reduce((a, prop) => typeof prop === "object" ? [...a, ...getObjectKeysRecursive(prop)] : a, Object.keys(obj))
export const getObjectKeysRecursive = (obj) => typeof obj === "object" ? Object.values(obj).flatMap(getObjectKeysRecursive).concat(Object.keys(obj)) : (typeof obj === "string" ? [obj] : [])

export function evalIfFunc<T, X>(value: T | ((arg: X) => T), arg: X): T {
  return typeof value === "function" ? (value as any)(arg) : value
}
//fromEntries doesn't result in StrictDict, this is just a utility wrapper.
export function objectKeyMap<K extends string | number, V>(keys: readonly K[], map: (key: K, i: number) => V): StrictDict<`${K}`, V> {
  return Object.fromEntries(keys.map((k, i) => [k, map(k, i)])) as any
}
//fromEntries doesn't result in StrictDict, this is just a utility wrapper.
export function objectKeyValueMap<T, K extends string | number, V>(items: readonly T[], map: (item: T) => [K, V]): StrictDict<`${K}`, V> {
  return Object.fromEntries(items.map(t => map(t))) as any
}

export function objectMap<K extends string, V, T>(obj: Partial<Record<K, V>>, fn: (value: V, key: `${K}`, index: number) => T): Partial<Record<K, T>>
export function objectMap<K extends string, V, T>(obj: Record<K, V>, fn: (value: V, key: `${K}`, index: number) => T): Record<K, T>
export function objectMap<K extends string, V, T>(obj: Partial<Record<K, V>>, fn: (value: V, key: `${K}`, index: number) => T): Partial<Record<K, T>> {
  return Object.fromEntries(Object.entries(obj).map(
    ([k, v], i) => [k, fn(v, k, i)]
  )) as any
}

const rangeGen = function* (from: number, to: number): Iterable<number> {
  for (let i = from; i <= to; i++) yield i;
};

/** range of [from, to], inclusive */
export function range(from: number, to: number): number[] {
  return [...rangeGen(from, to)]
}

export function assertUnreachable(value: never): never {
  throw new Error(`Should not reach this with value ${value}`)
}

/** Will change `arr` in-place */
export function toggleInArr<T>(arr: T[], value: T) {
  const ind = arr.indexOf(value)
  if (ind < 0) arr.push(value)
  else arr.splice(ind, 1)
}

export function toggleArr<T>(arr: T[], value: T) {
  return arr.includes(value) ? arr.filter(a => a !== value) : [...arr, value]
}

export function deepFreeze(obj: any, layers: number = 5) {
  if (layers === 0) return
  if (typeof obj === "object")
    Object.values(Object.freeze(obj)).forEach(o => deepFreeze(o, layers--))
}

export function arrayMove<T>(arr: T[], oldIndex: number, newIndex: number) {
  if (newIndex < 0 || newIndex >= arr.length) return arr
  if (oldIndex < 0 || oldIndex >= arr.length) return arr
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
  return arr
}

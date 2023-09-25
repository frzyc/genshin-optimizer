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
export function objPathValue(
  obj: object | undefined,
  keys: readonly string[]
): any {
  if (!obj || !keys) return undefined
  !Array.isArray(keys) && console.error(keys)
  return keys.reduce((a, k) => a?.[k], obj)
}
//delete the value denoted by the path. Will also delete empty objects as well.
export function deletePropPath(obj, path) {
  const tempPath = [...path]
  const lastKey = tempPath.pop()
  const objPathed = objPathValue(obj, tempPath)
  delete objPathed?.[lastKey]
}

export function objClearEmpties(o) {
  for (const k in o) {
    if (typeof o[k] !== 'object') continue
    objClearEmpties(o[k])
    if (!Object.keys(o[k]).length) delete o[k]
  }
}
export function crawlObject(
  obj: any,
  keys: string[] = [],
  validate: (o: any, keys: string[]) => boolean,
  cb: (o: any, keys: string[]) => void
) {
  if (validate(obj, keys)) cb(obj, keys)
  else
    obj &&
      typeof obj === 'object' &&
      Object.entries(obj).forEach(([key, val]) =>
        crawlObject(val, [...keys, key], validate, cb)
      )
}
// const getObjectKeysRecursive = (obj) => Object.values(obj).reduce((a, prop) => typeof prop === "object" ? [...a, ...getObjectKeysRecursive(prop)] : a, Object.keys(obj))
export const getObjectKeysRecursive = (obj) =>
  typeof obj === 'object'
    ? Object.values(obj)
        .flatMap(getObjectKeysRecursive)
        .concat(Object.keys(obj))
    : typeof obj === 'string'
    ? [obj]
    : []

export function evalIfFunc<T, X>(value: T | ((arg: X) => T), arg: X): T {
  return typeof value === 'function' ? (value as any)(arg) : value
}

/**
 * fromEntries doesn't result in StrictDict, this is just a utility wrapper.
 * @deprecated
 * @param items
 * @param map
 * @returns
 */
export function objectKeyValueMap<T, K extends string | number, V>(
  items: readonly T[],
  map: (item: T, i: number) => [K, V]
): StrictDict<`${K}`, V> {
  return Object.fromEntries(items.map((t, i) => map(t, i))) as any
}

/**
 * @deprecated use the @genshin-optimizer/util `objMap` function.
 * @param obj
 * @param fn
 */
export function objectMap<K extends string, V, T>(
  obj: Record<K, Exclude<V, undefined>>,
  fn: (value: V, key: `${K}`, index: number) => T
): Record<K, T>
export function objectMap<K extends string, V, T>(
  obj: Partial<Record<K, V>>,
  fn: (value: V, key: `${K}`, index: number) => T
): Partial<Record<K, T>>
export function objectMap<K extends string, V, T>(
  obj: Partial<Record<K, V>>,
  fn: (value: V, key: `${K}`, index: number) => T
): Partial<Record<K, T>> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)])
  ) as any
}

/**
 * @deprecated use the @genshin-optimizer/util `rangeGen` function.
 * @param from
 * @param to
 */
const rangeGen = function* (from: number, to: number): Iterable<number> {
  for (let i = from; i <= to; i++) yield i
}

/**
 * range of [from, to], inclusive
 * @deprecated use the @genshin-optimizer/util `range` function.
 * @param from
 * @param to
 */
export function range(from: number, to: number): number[] {
  return [...rangeGen(from, to)]
}

export function assertUnreachable(value: never): never {
  throw new Error(`Should not reach this with value ${value}`)
}

/**
 * cartesian product of list of arrays
 * @deprecated use the @genshin-optimizer/util `cartesian` function.
 * @param q
 * @returns
 */
export function cartesian<T>(...q: T[][]): T[][] {
  return q.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, [e]].flat())), [
    [],
  ] as T[][])
}

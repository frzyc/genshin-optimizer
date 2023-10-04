export function evalIfFunc<T, X>(value: T | ((arg: X) => T), arg: X): T {
  return typeof value === 'function' ? (value as any)(arg) : value
}

export function assertUnreachable(value: never): never {
  throw new Error(`Should not reach this with value ${value}`)
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
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v !== 'object') return
    ret[k as keyof T] = JSON.parse(JSON.stringify(v))
  })
  return ret
}

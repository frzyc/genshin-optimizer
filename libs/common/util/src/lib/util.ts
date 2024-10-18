export function evalIfFunc<T, X extends unknown[]>(
  value: T | ((...args: X) => T),
  ...args: X
): T {
  return typeof value === 'function' ? (value as any)(...args) : value
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

export function isIn<T>(values: readonly T[], val: any): val is T {
  return values.includes(val)
}

export function nameToKey(name: string) {
  if (!name) name = ''
  return name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
    .join('')
}

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

//assign obj.[keys...] = value
export function layeredAssignment<T>(
  obj: any,
  keys: Array<number | string>,
  value: T
) {
  keys.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) return (accu[key] = value)
    if (!accu[key]) accu[key] = {}
    return accu[key]
  }, obj)
  return obj
}

/**
 * Filter the object to only have key:value for a correspoding array of keys
 * Assumes that `keys` is a superset of Object.keys(obj)
 * @param obj
 * @param keys
 * @returns
 */
export function objFilterKeys<K extends string, K2 extends string, V>(
  obj: Record<K, V>,
  keys: K2[]
): Record<K2, V> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => keys.includes(k as K2))
  ) as Record<K2, V>
}

export function objMap<K extends string | number, V, V2>(
  obj: Record<K, V>,
  f: (v: V, k: K, i: number) => V2
): Record<K, V2> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v], i) => [k, f(v as V, k as K, i)])
  ) as Record<K, V2>
}

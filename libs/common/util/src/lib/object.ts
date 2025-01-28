// crawl an object, calling a callback on every object that passes a validation function
export function crawlObject<T, O>(
  obj: Record<string, T> | T,
  keys: string[] = [],
  validate: (o: unknown, keys: string[]) => boolean,
  cb: (o: O, keys: string[]) => void
) {
  if (validate(obj as T, keys)) cb(obj as O, keys)
  else
    obj &&
      typeof obj === 'object' &&
      Object.entries(obj).forEach(([key, val]) =>
        crawlObject(val, [...keys, key], validate, cb)
      )
}

// crawl an object, calling a callback on every object that passes a validation function
export async function crawlObjectAsync<T, O>(
  obj: Record<string, T> | T,
  keys: string[] = [],
  validate: (o: unknown, keys: string[]) => boolean,
  cb: (o: O, keys: string[]) => Promise<void>
) {
  if (validate(obj as T, keys)) await cb(obj as O, keys)
  else if (obj && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      crawlObjectAsync(val, [...keys, key], validate, cb)
    }
  }
}

// assign a value to a nested object, creating the path if it doesn't exist yet. obj.[keys...] = value
export function layeredAssignment<T, Obj>(
  obj: Obj,
  keys: readonly (number | string)[],
  value: T
): Obj {
  keys.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) {
      accu[key] = value
      return accu
    }
    if (!accu[key]) accu[key] = {}
    return accu[key] as Record<number | string, unknown>
  }, obj as Record<number | string, unknown>)
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
): Record<K, V2>
export function objMap<K extends string | number, V, V2>(
  obj: Partial<Record<K, V>>,
  f: (v: V, k: K, i: number) => V2
): Partial<Record<K, V2>>
export function objMap<K extends string | number, V, V2>(
  obj: Record<K, V>,
  f: (v: V, k: K, i: number) => V2
): Record<K, V2> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v], i) => [k, f(v as V, k as K, i)])
  ) as Record<K, V2>
}

export function objFilter<K extends string | number, V>(
  obj: Record<K, V>,
  f: (v: V, k: K, i: number) => boolean
): Record<K, V> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v], i) => f(v as V, k as K, i))
  ) as Record<K, V>
}

/**
 * Generate an object from an array of keys, and a function that maps the key to a value
 * @param keys
 * @param map
 * @returns
 */
export function objKeyMap<K extends string | number, V>(
  keys: readonly K[],
  map: (key: K, i: number) => V
): Record<K, V> {
  return Object.fromEntries(keys.map((k, i) => [k, map(k, i)])) as Record<K, V>
}

export function objKeyValMap<K, K2 extends string | number, V>(
  items: readonly K[],
  map: (item: K, i: number) => [K2, V]
): Record<K2, V> {
  return Object.fromEntries(items.map((t, i) => map(t, i))) as Record<K2, V>
}

//multiplies every numerical value in the obj by a multiplier.
export function objMultiplication(obj: Record<string, unknown>, multi: number) {
  if (multi === 1) return obj
  Object.keys(obj).forEach((prop: any) => {
    if (typeof obj[prop] === 'object')
      objMultiplication(
        (obj as Record<string, Record<string, unknown>>)[prop],
        multi
      )
    if (typeof obj[prop] === 'number')
      obj[prop] = (obj as Record<string, number>)[prop] * multi
  })
  return obj
}
//delete the value denoted by the path. Will also delete empty objects as well.
export function deletePropPath(
  obj: Record<string, unknown>,
  path: readonly string[]
) {
  const tempPath = [...path]
  const lastKey = tempPath.pop()
  if (!lastKey) return
  const objPathed = objPathValue(obj, tempPath)
  delete objPathed?.[lastKey]
}

//get the value in a nested object, giving array of path
export function objPathValue(
  obj: object | undefined,
  keys: readonly string[]
): any {
  if (!obj || !keys) return undefined
  return keys.reduce((a, k) => (a as any)?.[k], obj)
}

export function objClearEmpties(o: Record<string, unknown>) {
  for (const k in o) {
    if (typeof o[k] !== 'object') continue
    objClearEmpties(o[k] as Record<string, unknown>)
    if (!Object.keys(o[k] as Record<string, unknown>).length) delete o[k]
  }
}

export const getObjectKeysRecursive = (obj: unknown): string[] =>
  typeof obj === 'object'
    ? Object.values(obj as Record<string, unknown>)
        .flatMap(getObjectKeysRecursive)
        .concat(Object.keys(obj as Record<string, unknown>))
    : typeof obj === 'string'
    ? [obj]
    : []

export function deepFreeze<T>(obj: T, layers = 5): T {
  if (layers === 0) return obj
  if (obj && typeof obj === 'object')
    Object.values(Object.freeze(obj)).forEach((o) => deepFreeze(o, layers - 1))
  return obj
}

export class ObjNotMatchError extends Error {
  readonly extraKeys: string[]
  readonly missingKeys: string[]

  constructor(extraKeys: string[], missingKeys: string[], message?: string) {
    if (!message)
      message = `obj did not match keys. missing: ${missingKeys}. extraneous: ${extraKeys}`
    super(message)
    this.extraKeys = extraKeys
    this.missingKeys = missingKeys
  }
}

/**
 * Checks if an object has exactly the keys provided.
 * Narrows the object type using a type predicate on success.
 * Throws an error otherwise
 * @param obj Object to check
 * @param keys Exact keys to be present in the object
 */
export function verifyObjKeys<K extends string, V>(
  obj: Partial<Record<K, V>>,
  keys: readonly K[]
): asserts obj is Record<K, V> {
  const extraKeys = extraneousObjKeys(obj, keys)
  const missingKeys = missingObjKeys(obj, keys)
  if (extraKeys.length > 0 || missingKeys.length > 0) {
    throw new ObjNotMatchError(extraKeys, missingKeys)
  }
}

export function extraneousObjKeys<K extends string, V>(
  obj: Partial<Record<K, V>>,
  keys: readonly K[]
) {
  return Object.keys(obj).filter(
    (k) => !(keys as readonly string[]).includes(k)
  )
}

export function missingObjKeys<K extends string, V>(
  obj: Partial<Record<K, V>>,
  keys: readonly K[]
) {
  return keys.filter((k) => !(Object.keys(obj) as string[]).includes(k))
}

/**
 * reverses the keys and values of an object
 */
export function reverseMap<K extends string, V extends string>(
  obj: Record<K, V>
): Record<V, K> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [v, k])
  ) as Record<V, K>
}

export function shallowCompareObj<T extends Record<string, any>>(
  obj1: T,
  obj2: T
) {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  // Check if the objects have the same number of keys
  if (keys1.length !== keys2.length) return false

  // Check if all keys and their values are the same
  for (const key of keys1) if (obj1[key] !== obj2[key]) return false

  return true
}

export function objFindValue<K extends string, V extends string>(
  obj: Record<K, V>,
  value: V
): K | undefined {
  return Object.keys(obj).find((k) => obj[k as K] === value) as K | undefined
}

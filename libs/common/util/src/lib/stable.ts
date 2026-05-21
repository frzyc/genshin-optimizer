const EMPTY_ARRAY: readonly never[] = []
const EMPTY_OBJECT: Readonly<Record<string, never>> = Object.freeze({})

/** Shared empty array for stable React deps / context fallbacks. */
export function stableArr<T>(): readonly T[] {
  return EMPTY_ARRAY as readonly T[]
}

/** Shared empty object for stable React deps / context fallbacks. */
export function stableObj<
  T extends object = Record<string, never>,
>(): Readonly<T> {
  return EMPTY_OBJECT as Readonly<T>
}

export function getArrLastElement<E>(arr: E[]): E | null {
  return arr.length ? arr[arr.length - 1] : null
}

const rangeGen = function* (
  from: number,
  to: number,
  step: number
): Iterable<number> {
  for (let i = from; i <= to; i += step) yield i
}

/** range of [from, to], inclusive */
export function range(from: number, to: number, step = 1): number[] {
  return [...rangeGen(from, to, step)]
}

/** Will change `arr` in-place */
export function toggleInArr<T>(arr: T[], value: T) {
  const ind = arr.indexOf(value)
  if (ind < 0) arr.push(value)
  else arr.splice(ind, 1)
  return arr
}

// cartesian product of list of arrays
export function cartesian<T>(...q: T[][]): T[][] {
  return q.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, [e]].flat())), [
    [],
  ] as T[][])
}

export function toggleArr<T>(arr: T[], value: T) {
  return arr.includes(value) ? arr.filter((a) => a !== value) : [...arr, value]
}

// Move an item in an array from one position to another
export function arrayMove<T>(arr: T[], oldIndex: number, newIndex: number) {
  if (newIndex < 0 || newIndex >= arr.length) return arr
  if (oldIndex < 0 || oldIndex >= arr.length) return arr
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
  return arr
}

// Transpose a 2D array
export function transposeArray<T>(arr: T[][]): T[][] {
  return arr[0].map((_, i) => arr.map((row) => row[i]))
}

export function linspace(
  start: number,
  stop: number,
  num: number,
  inclusiveEnd = true
) {
  const step = (stop - start) / (inclusiveEnd ? num - 1 : num)
  return range(0, num - 1).map((i) => start + step * i)
}

/** Intended to use with array.filter function to type check against Array<TValue|undefined> -> Array<TValue> */
export function notEmpty<T>(value: T | null | undefined | ''): value is T {
  return value !== null && value !== undefined
}

/**
 * Allow a "smart" toggling of elements within an array.
 * @param allKeys
 * @returns
 */
export function handleMultiSelect<T>(allKeys: T[]) {
  return (arr: T[], v: T): T[] => {
    const len = arr.length
    if (len === allKeys.length) return [v]
    if (len === 1 && arr[0] === v) return [...allKeys]
    return [...new Set(toggleArr(arr, v))]
  }
}

/**
 * Shorten or pad an array to a certain length, with a default value.
 * Modifies the array in-place.
 * @param array
 * @param length
 * @param value
 * @returns The modified array
 */
export function pruneOrPadArray<T>(array: T[], length: number, value: T) {
  if (array.length > length) array.length = length
  else array.push(...new Array(length - array.length).fill(value))
  return array
}

/**
 * Move an element in the array to the front, if it exists.
 * @param arr
 * @param key
 * @returns
 */
export function moveToFront<T>(arr: T[], key: T): T[] {
  const index = arr.indexOf(key)
  if (index > -1) {
    // Remove the element from its current position
    const [element] = arr.splice(index, 1)
    // Add the element to the front of the array
    arr.unshift(element)
  }
  return arr
}

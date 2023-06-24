export function getArrLastElement<E>(arr: E[]): E | null {
  return arr.length ? arr[arr.length - 1] : null
}

const rangeGen = function* (from: number, to: number): Iterable<number> {
  for (let i = from; i <= to; i++) yield i
}

/** range of [from, to], inclusive */
export function range(from: number, to: number): number[] {
  return [...rangeGen(from, to)]
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

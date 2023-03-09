import { objectMap } from './Util'
type Entry = {
  total: number
  current: number
}
type CatTotalKey = string | number | symbol
// A helper function to generate multiple `current/total` formated string object with categories using a single callback
export function bulkCatTotal(
  catTotals: Record<CatTotalKey, readonly CatTotalKey[]>,
  cb: (ctMap: Record<CatTotalKey, Record<CatTotalKey, Entry>>) => void
) {
  const ctMap = objectMap(catTotals, (keys) => catTotalObj(keys))
  cb(ctMap)
  return objectMap(ctMap, (ct) => catTotalToStringObj(ct))
}
// A helper function to generate a `current/total` formated string object with categories
export function catTotal<T extends CatTotalKey>(
  keys: readonly T[],
  cb: (ct: Record<T, Entry>) => void
) {
  const ct = catTotalObj(keys)
  cb(ct)
  return catTotalToStringObj(ct)
}

function catTotalObj<T extends CatTotalKey>(
  keys: readonly T[]
): Record<T, Entry> {
  return Object.fromEntries(
    keys.map((k) => [k, { total: 0, current: 0 }])
  ) as Record<T, Entry>
}

function catTotalToStringObj<T extends CatTotalKey>(tot: Record<T, Entry>) {
  return objectMap(tot, ({ total, current }) =>
    current === total ? `${total}` : `${current}/${total}`
  ) as Record<T, string>
}

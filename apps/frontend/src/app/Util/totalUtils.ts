import { objectMap } from "./Util"
type Entry = {
  total: number,
  current: number,
}
// A helper function to generate a `current/total` formated string object with categories
export function catTotal<T extends string | number | symbol>(keys: readonly T[], cb: (ct: Record<T, Entry>) => void) {
  const ct = catTotalObj(keys)
  cb(ct)
  return catTotalToStringObj(ct)
}

function catTotalObj<T extends string | number | symbol>(keys: readonly T[]): Record<T, Entry> {
  return Object.fromEntries(keys.map(k => [k, { total: 0, current: 0 }])) as Record<T, Entry>
}

function catTotalToStringObj<T extends string | number | symbol>(tot: Record<T, Entry>) {
  return objectMap(tot, ({ total, current }) => current === total ? `${total}` : `${current}/${total}`) as Record<T, string>
}

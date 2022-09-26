type SortConfig<T> = (id: T) => number | string
export type SortConfigs<Keys extends string, T> = Record<Keys, SortConfig<T>>

export function sortFunction<Keys extends string, T>(sortbyKeys: Keys[], ascending: boolean, configs: SortConfigs<Keys, T>, ascendingBypass: Keys[] = []) {
  return (a: T, b: T): number => {
    for (const sortby of sortbyKeys) {
      let diff = 0
      const config = configs[sortby]
      const aV = config(a)
      const bV = config(b)
      if (typeof aV === "string" && typeof bV === "string") diff = aV.localeCompare(bV)
      else diff = ((bV as number) - (aV as number))
      if (diff !== 0) return ascendingBypass.includes(sortby) ? diff : (ascending ? -1 : 1) * diff
    }
    return 0
  }
}

type FilterConfig<T> = (obj: T, filter: any) => boolean
export type FilterConfigs<Keys extends string, T> = Record<Keys, FilterConfig<T>>
export function filterFunction<Keys extends string, T>(filterOptions: Partial<Record<Keys, any>>, filterConfigs: FilterConfigs<Keys, T>) {
  return (obj: T) => Object.entries(filterOptions).every(([optionKey, optionVal]) => filterConfigs[optionKey as any] && filterConfigs[optionKey as any](obj, optionVal))
}

type SortConfig<T> = {
  getValue: (id: T) => number | string
  tieBreakers?: string[]
}
export type SortConfigs<Keys extends string, T> = Record<Keys, SortConfig<T>>

export function sortFunction<Keys extends string, T>(sortbyKeys: string[], ascending: boolean, configs: SortConfigs<Keys, T>): (a: T, b: T) => number {
  function Sort(a: T, b: T, ascending: boolean, config: SortConfig<T>) {
    const aV = config.getValue(a)
    const bV = config.getValue(b)
    let diff = 0
    if (typeof aV === "string" && typeof bV === "string")
      diff = aV.localeCompare(bV)
    else
      diff = ((bV as number) - (aV as number))
    return (ascending ? -1 : 1) * diff
  }

  return (a: T, b: T) => {
    let diff: number = 0;
    for (const sortby of sortbyKeys) {
      const sortConfig: SortConfig<T> = configs[sortby]
      if (!sortConfig) return 0
      diff = Sort(a, b, ascending, sortConfig)
      if (diff) return diff

      if (sortConfig.tieBreakers) for (const tieBreaker of sortConfig.tieBreakers) {
        diff = Sort(a, b, ascending, configs[tieBreaker])
        if (diff) return diff
      }
    }

    return diff
  }
}

type FilterConfig<T> = (obj: T, filter: any) => boolean
export type FilterConfigs<Keys extends string, T> = Record<Keys, FilterConfig<T>>
export function filterFunction<Keys extends string, T>(filterOptions: Record<Keys, any>, filterConfigs: FilterConfigs<Keys, T>) {
  return (obj: T) => Object.entries(filterOptions).every(([optionKey, optionVal]) => filterConfigs[optionKey as any] && filterConfigs[optionKey as any](obj, optionVal))
}

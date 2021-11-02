type SortConfig<T> = {
  getValue: (id: T) => number | string
  tieBreaker?: string
}
export type SortConfigs<Keys extends string, T> = Record<Keys, SortConfig<T>>

export function sortFunction<Keys extends string, T>(sortby: string, ascending: boolean, configs: SortConfigs<Keys, T>) {
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
    if (!configs[sortby]) return 0
    const filterOption = configs[sortby]
    let diff = Sort(a, b, ascending, filterOption)
    if (!diff && filterOption.tieBreaker && configs[filterOption.tieBreaker])
      diff = Sort(a, b, ascending, configs[filterOption.tieBreaker])
    return diff
  }
}

type FilterConfig<T> = (obj: T, filter: any) => boolean
export type FilterConfigs<Keys extends string, T> = Record<Keys, FilterConfig<T>>
export function filterFunction<Keys extends string, T>(filterOptions: Record<Keys, any>, filterConfigs: FilterConfigs<Keys, T>) {
  return (obj: T) => Object.entries(filterOptions).every(([optionKey, optionVal]) => filterConfigs[optionKey as any](obj, optionVal))
}
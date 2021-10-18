
interface SortOption {
  getValue: (id: string) => number | string
  tieBreaker?: string
}
export interface SortOptions { [key: string]: SortOption }


export default function SortByFilters(sortby: string, ascending: boolean, options: SortOptions) {
  function Sort(a: string, b: string, ascending: boolean, filterOption: SortOption,) {
    const aV = filterOption.getValue(a)
    const bV = filterOption.getValue(b)
    let diff = 0
    if (typeof aV === "string" && typeof aV === "string")
      diff = a.localeCompare(b)
    else
      diff = ((bV as number) - aV)
    return (ascending ? -1 : 1) * diff
  }
  return (a: string, b: string) => {
    const filterOption = options[sortby]
    let diff = Sort(a, b, ascending, filterOption)
    if (!diff && filterOption.tieBreaker)
      diff = Sort(a, b, ascending, options[filterOption.tieBreaker])
    return diff
  }
}

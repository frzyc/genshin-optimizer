import type { SolverConfig } from '@genshin-optimizer/game-opt/solver'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSetKeys, allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { CreateSolverConfigArgs } from '.'

export function rainbowFilter({
  setFilter2,
  setFilter4,
  wengines,
  discsBySlot,
}: CreateSolverConfigArgs): SolverConfig<string>['filter'] {
  // empty = any set
  setFilter2 = setFilter2.length ? setFilter2 : [...allDiscSetKeys]
  setFilter4 = setFilter4.length ? setFilter4 : [...allDiscSetKeys]

  const idBySlot = Object.fromEntries(
    Object.entries(discsBySlot).map(([key, discs]) => {
      const map = new Map<DiscSetKey, string[]>()
      for (const disc of discs) {
        const m = map.get(disc.setKey) ?? []
        m.push(disc.id)
        map.set(disc.setKey, m)
      }
      return [key, map] as const
    })
  )

  const result: Set<string>[] = []

  function assignSlots(
    index: number,
    group4: DiscSlotKey[],
    group2: DiscSlotKey[]
  ): void {
    if (index < allDiscSlotKeys.length) {
      const slot = allDiscSlotKeys[index]
      if (group4.length < 4) assignSlots(index + 1, [...group4, slot], group2)
      if (group2.length < 2) assignSlots(index + 1, group4, [...group2, slot])
      return
    }

    // Compute intersection of sets available in all slots
    const set4Candidates = group4.reduce(
      (acc, slot) => new Set([...acc].filter((s) => idBySlot[slot].has(s))),
      new Set(setFilter4)
    )
    const set2Candidates = group2.reduce(
      (acc, slot) => new Set([...acc].filter((s) => idBySlot[slot].has(s))),
      new Set(setFilter2)
    )

    // Find all valid set pairs
    for (const set4 of set4Candidates)
      for (const set2 of set2Candidates)
        if (set4 !== set2)
          result.push(
            new Set([
              ...wengines.map((e) => e.id),
              ...group4.flatMap((s) => idBySlot[s].get(set4)!),
              ...group2.flatMap((s) => idBySlot[s].get(set2)!),
            ])
          )
  }

  assignSlots(0, [], [])
  return result
}

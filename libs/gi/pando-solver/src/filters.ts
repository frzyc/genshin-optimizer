import type { SolverConfig } from '@genshin-optimizer/game-opt/solver'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
} from '@genshin-optimizer/gi/consts'
import type { CreateSolverConfigArgs } from '.'

/** 4+1 ID groups. Off-piece may match the 4pc set so AAAAA is included. */
export function rainbowFilter({
  setFilter4,
  weapons,
  artsBySlot,
}: CreateSolverConfigArgs): SolverConfig<string>['filter'] {
  const fourPcSets = setFilter4.length ? setFilter4 : [...allArtifactSetKeys]

  const idBySlot = Object.fromEntries(
    Object.entries(artsBySlot).map(([key, arts]) => {
      const map = new Map<ArtifactSetKey, string[]>()
      for (const art of arts) {
        const m = map.get(art.setKey) ?? []
        m.push(art.id)
        map.set(art.setKey, m)
      }
      return [key, map] as const
    })
  ) as Record<ArtifactSlotKey, Map<ArtifactSetKey, string[]>>

  const result: Set<string>[] = []

  function assignSlots(
    index: number,
    group4: ArtifactSlotKey[],
    group1: ArtifactSlotKey[]
  ): void {
    if (index < allArtifactSlotKeys.length) {
      const slot = allArtifactSlotKeys[index]
      if (group4.length < 4) assignSlots(index + 1, [...group4, slot], group1)
      if (group1.length < 1) assignSlots(index + 1, group4, [...group1, slot])
      return
    }

    const set4Candidates = group4.reduce(
      (acc, slot) => new Set([...acc].filter((s) => idBySlot[slot].has(s))),
      new Set(fourPcSets)
    )
    const set1Candidates = new Set(idBySlot[group1[0]].keys())

    for (const set4 of set4Candidates)
      for (const set1 of set1Candidates)
        result.push(
          new Set([
            ...weapons.map((e) => e.id),
            ...group4.flatMap((s) => idBySlot[s].get(set4)!),
            ...group1.flatMap((s) => idBySlot[s].get(set1)!),
          ])
        )
  }

  assignSlots(0, [], [])
  return result
}

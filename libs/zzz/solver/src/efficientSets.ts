import { objKeyMap } from '@genshin-optimizer/common/util'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSetKeys, allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'

function buildCount<V>(candidates: V[][]): number {
  return candidates.reduce((num, cnds) => num * cnds.length, 1)
}

export const EFFICIENT_SET_COUNTS = [4, 2] as const

/** Min slot pools a set must appear in to ever be the 2-piece set (one disc per slot). */
export const MIN_DISTINCT_SLOTS_FOR_2P_SET = 2

/** Min slot pools a set must appear in to ever be the 4-piece set. */
export const MIN_DISTINCT_SLOTS_FOR_4P_SET = 4

export function isEfficient42Composition(counts: number[]): boolean {
  const used = counts.filter((c) => c > 0)
  if (used.length !== 2) return false
  return (used[0] === 4 && used[1] === 2) || (used[0] === 2 && used[1] === 4)
}

export function countDistinctSlotsBySet(
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
): Map<DiscSetKey, number> {
  const slotsBySet = new Map<DiscSetKey, Set<DiscSlotKey>>()
  for (const slot of allDiscSlotKeys) {
    for (const { setKey } of discsBySlot[slot]) {
      let slots = slotsBySet.get(setKey)
      if (!slots) {
        slots = new Set()
        slotsBySet.set(setKey, slots)
      }
      slots.add(slot)
    }
  }
  return new Map(
    [...slotsBySet.entries()].map(([setKey, slots]) => [setKey, slots.size])
  )
}

/** Drops discs whose set cannot fill a 2-piece role in any 4:2 build. */
export function pruneDiscsFor42Inventory(
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
): Record<DiscSlotKey, ICachedDisc[]> {
  const distinctSlots = countDistinctSlotsBySet(discsBySlot)
  return objKeyMap(allDiscSlotKeys, (slot) =>
    discsBySlot[slot].filter(
      (d) => (distinctSlots.get(d.setKey) ?? 0) >= MIN_DISTINCT_SLOTS_FOR_2P_SET
    )
  )
}

// generate every unordered 4-tuple of slots
function* combinations4(
  slots: readonly DiscSlotKey[]
): Generator<DiscSlotKey[]> {
  const n = slots.length
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++)
          yield [slots[a], slots[b], slots[c], slots[d]]
}

function setsWithDiscInEverySlot(
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
  slots: DiscSlotKey[]
): DiscSetKey[] {
  return allDiscSetKeys.filter((setKey) =>
    slots.every((slot) => discsBySlot[slot].some((d) => d.setKey === setKey))
  )
}

function candidateSetsForGroup(
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
  distinctSlots: Map<DiscSetKey, number>,
  groupSlots: DiscSlotKey[],
  setFilter: DiscSetKey[],
  minDistinctSlots: number
): DiscSetKey[] {
  return setsWithDiscInEverySlot(discsBySlot, groupSlots)
    .filter((setKey) => !setFilter.length || setFilter.includes(setKey))
    .filter((setKey) => (distinctSlots.get(setKey) ?? 0) >= minDistinctSlots)
}

export function filterDiscsFor42Assignment(
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
  group4: DiscSlotKey[],
  setA: DiscSetKey,
  setB: DiscSetKey
): Record<DiscSlotKey, ICachedDisc[]> | undefined {
  const filtered = objKeyMap(allDiscSlotKeys, (slot) => {
    const setKey = group4.includes(slot) ? setA : setB
    return discsBySlot[slot].filter((d) => d.setKey === setKey)
  })
  if (allDiscSlotKeys.some((slot) => !filtered[slot].length)) return undefined
  return filtered
}

export interface FourTwoAssignment {
  group4: DiscSlotKey[]
  group2: DiscSlotKey[]
  setA: DiscSetKey
  setB: DiscSetKey
}

export function* iterate42Assignments(
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
  setFilter2: DiscSetKey[],
  setFilter4: DiscSetKey[]
): Generator<FourTwoAssignment> {
  const distinctSlots = countDistinctSlotsBySet(discsBySlot)

  for (const group4 of combinations4(allDiscSlotKeys)) {
    const group4Set = new Set(group4)
    const group2 = allDiscSlotKeys.filter((slot) => !group4Set.has(slot))

    const setACandidates = candidateSetsForGroup(
      discsBySlot,
      distinctSlots,
      group4,
      setFilter4,
      MIN_DISTINCT_SLOTS_FOR_4P_SET
    )
    const setBCandidates = candidateSetsForGroup(
      discsBySlot,
      distinctSlots,
      group2,
      setFilter2,
      MIN_DISTINCT_SLOTS_FOR_2P_SET
    )

    for (const setA of setACandidates) {
      for (const setB of setBCandidates) {
        if (setA === setB) continue
        const filtered = filterDiscsFor42Assignment(
          discsBySlot,
          group4,
          setA,
          setB
        )
        if (filtered) yield { group4, group2, setA, setB }
      }
    }
  }
}

export function count42BuildPermutations(
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
  setFilter2: DiscSetKey[],
  setFilter4: DiscSetKey[],
  wengineCount: number
): number {
  const pruned = pruneDiscsFor42Inventory(discsBySlot)
  let total = 0
  for (const { group4, setA, setB } of iterate42Assignments(
    pruned,
    setFilter2,
    setFilter4
  )) {
    const filtered = filterDiscsFor42Assignment(pruned, group4, setA, setB)
    if (filtered) total += buildCount(Object.values(filtered)) * wengineCount
  }
  return total
}

import { objKeyMap } from '@genshin-optimizer/common/util'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import {
  countDistinctSlotsBySet,
  filterDiscsFor42Assignment,
  isEfficient42Composition,
  iterate42Assignments,
  pruneDiscsFor42Inventory,
} from './efficientSets'

function mockDisc(
  id: string,
  slotKey: DiscSlotKey,
  setKey: DiscSetKey
): ICachedDisc {
  return { id, slotKey, setKey } as ICachedDisc
}

function emptyDiscsBySlot(): Record<DiscSlotKey, ICachedDisc[]> {
  return objKeyMap(allDiscSlotKeys, () => [])
}

describe('isEfficient42Composition', () => {
  test('accepts 4+2', () => {
    expect(isEfficient42Composition([4, 2])).toBe(true)
    expect(isEfficient42Composition([2, 4])).toBe(true)
  })

  test('rejects invalid histograms', () => {
    expect(isEfficient42Composition([6])).toBe(false)
    expect(isEfficient42Composition([4, 1, 1])).toBe(false)
    expect(isEfficient42Composition([2, 2, 2])).toBe(false)
    expect(isEfficient42Composition([3, 3])).toBe(false)
    expect(isEfficient42Composition([5, 1])).toBe(false)
  })
})

describe('countDistinctSlotsBySet', () => {
  test('counts slot pools, not total disc count', () => {
    const discsBySlot = emptyDiscsBySlot()
    discsBySlot['4'].push(
      mockDisc('b1', '4', 'HormonePunk'),
      mockDisc('b2', '4', 'HormonePunk')
    )
    discsBySlot['5'].push(mockDisc('b3', '5', 'HormonePunk'))

    expect(countDistinctSlotsBySet(discsBySlot).get('HormonePunk')).toBe(2)
  })
})

describe('pruneDiscsFor42Inventory', () => {
  test('removes discs from sets that appear only once in inventory', () => {
    const discsBySlot = emptyDiscsBySlot()
    discsBySlot['1'].push(mockDisc('a1', '1', 'FangedMetal'))
    discsBySlot['2'].push(mockDisc('b1', '2', 'HormonePunk'))
    discsBySlot['3'].push(mockDisc('b2', '3', 'HormonePunk'))

    const pruned = pruneDiscsFor42Inventory(discsBySlot)
    expect(pruned['1']).toHaveLength(0)
    expect(pruned['2']).toHaveLength(1)
    expect(pruned['3']).toHaveLength(1)
  })

  test('removes sets with multiple discs in only one slot', () => {
    const discsBySlot = emptyDiscsBySlot()
    discsBySlot['4'].push(
      mockDisc('b1', '4', 'HormonePunk'),
      mockDisc('b2', '4', 'HormonePunk')
    )

    const pruned = pruneDiscsFor42Inventory(discsBySlot)
    expect(pruned['4']).toHaveLength(0)
  })
})

describe('iterate42Assignments', () => {
  const setA = 'FangedMetal' as DiscSetKey
  const setB = 'HormonePunk' as DiscSetKey

  function discsWith42Pair(): Record<DiscSlotKey, ICachedDisc[]> {
    const discsBySlot = emptyDiscsBySlot()
    for (const slot of ['1', '2', '3', '4'] as DiscSlotKey[]) {
      discsBySlot[slot].push(mockDisc(`a-${slot}`, slot, setA))
    }
    discsBySlot['5'].push(mockDisc('b-5', '5', setB))
    discsBySlot['6'].push(mockDisc('b-6', '6', setB))
    return discsBySlot
  }

  test('setFilter4=[A] and setFilter2=[B] yields only (A,B) assignments', () => {
    const assignments = [
      ...iterate42Assignments(discsWith42Pair(), [setB], [setA]),
    ]
    expect(assignments.length).toBeGreaterThan(0)
    expect(assignments.every((a) => a.setA === setA && a.setB === setB)).toBe(
      true
    )
  })

  test('setFilter4=[A] and setFilter2=[A] yields zero assignments', () => {
    const assignments = [
      ...iterate42Assignments(discsWith42Pair(), [setA], [setA]),
    ]
    expect(assignments).toHaveLength(0)
  })

  test('setFilter2=[B] yields zero when B only has slot-4 discs', () => {
    const discsBySlot = discsWith42Pair()
    discsBySlot['5'] = []
    discsBySlot['6'] = []
    discsBySlot['4'].push(
      mockDisc('b-4a', '4', setB),
      mockDisc('b-4b', '4', setB)
    )

    const assignments = [
      ...iterate42Assignments(
        pruneDiscsFor42Inventory(discsBySlot),
        [setB],
        []
      ),
    ]
    expect(assignments).toHaveLength(0)
  })

  test('filterDiscsFor42Assignment keeps only assigned sets per slot', () => {
    const discsBySlot = discsWith42Pair()
    const group4 = ['1', '2', '3', '4'] as DiscSlotKey[]
    const group2 = ['5', '6'] as DiscSlotKey[]
    const filtered = filterDiscsFor42Assignment(discsBySlot, group4, setA, setB)
    expect(filtered).toBeDefined()
    for (const slot of group4) {
      expect(filtered![slot].every((d) => d.setKey === setA)).toBe(true)
    }
    for (const slot of group2) {
      expect(filtered![slot].every((d) => d.setKey === setB)).toBe(true)
    }
  })
})

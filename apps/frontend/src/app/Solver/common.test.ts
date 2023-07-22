import {
  allArtifactSlotKeys,
  type ArtifactSetKey,
  type ArtifactSlotKey,
} from '@genshin-optimizer/consts'
import { objKeyMap } from '@genshin-optimizer/util'
import type { ArtSetExclusion } from '../Database/DataManagers/BuildSettingData'
import type { OptNode } from '../Formula/optimization'
import { precompute } from '../Formula/optimization'
import { dynRead, prod, sum, threshold } from '../Formula/utils'
import { cartesian } from '../Util/Util'
import type { ArtifactBuildData, ArtifactsBySlot } from './common'
import { artSetPerm, exclusionToAllowed, pruneAll } from './common'

function* allCombinations(
  sets: StrictDict<ArtifactSlotKey, ArtifactSetKey[]>
): Iterable<StrictDict<ArtifactSlotKey, ArtifactSetKey>> {
  for (const flower of sets.flower)
    for (const circlet of sets.circlet)
      for (const goblet of sets.goblet)
        for (const plume of sets.plume)
          for (const sands of sets.sands)
            yield { flower, circlet, goblet, plume, sands }
}

describe('common.ts', () => {
  describe('artSetPerm should handle', () => {
    const filter: ArtSetExclusion = {
      Adventurer: [2, 4],
      ArchaicPetra: [4],
      Berserker: [2, 4],
      rainbow: [2, 4],
    }
    const artSets: ArtifactSetKey[] = [
      'Adventurer',
      'ArchaicPetra',
      'Berserker',
      'BloodstainedChivalry',
    ]
    const perm = [...artSetPerm(filter, artSets)],
      allowedRainbows = exclusionToAllowed(filter.rainbow)

    for (const combination of allCombinations(
      objKeyMap(allArtifactSlotKeys, (_) => artSets)
    )) {
      let shouldMatch = true,
        rainbowCount = 0
      for (const key of new Set([
        ...Object.keys(filter),
        ...Object.values(combination),
      ])) {
        const allowed = exclusionToAllowed(filter[key])
        const count = Object.values(combination).filter((x) => x === key).length
        if (count === 1) rainbowCount++
        if (!allowed.has(count)) shouldMatch = false
      }
      if (!allowedRainbows.has(rainbowCount)) shouldMatch = false
      const matchCount = perm.filter((filters) =>
        allArtifactSlotKeys.every((slot) => {
          const art = combination[slot]
          const filter = filters[slot]
          switch (filter.kind) {
            case 'id':
              throw new Error('ID filter in artSetPerm')
            case 'required':
              return filter.sets.has(art)
            case 'exclude':
              return !filter.sets.has(art)
          }
        })
      ).length

      test(`Set ${Object.values(combination)}`, () => {
        expect(matchCount).toEqual(shouldMatch ? 1 : 0)
      })
    }
  })

  function testFormulasEqual(
    f1: { nodes: OptNode[]; arts: ArtifactsBySlot },
    f2: { nodes: OptNode[]; arts: ArtifactsBySlot }
  ) {
    const compute1 = precompute(f1.nodes, f1.arts.base, (f) => f.path[1], 5)
    const compute2 = precompute(f2.nodes, f2.arts.base, (f) => f.path[1], 5)
    const truth = cartesian(
      ...allArtifactSlotKeys.map((slot) => f1.arts.values[slot])
    ).map((aa) => compute1(aa))
    const test = cartesian(
      ...allArtifactSlotKeys.map((slot) => f2.arts.values[slot])
    ).map((aa) => compute2(aa))

    truth.forEach((trut, i) =>
      trut.forEach((tru, j) => expect(tru).toBeCloseTo(test[i][j]))
    )
  }

  describe('reaffine', () => {
    const arts: ArtifactsBySlot = {
      base: { atk: 10, atk_: 0.01, glad: 0, clam: 0 },
      values: objKeyMap(
        allArtifactSlotKeys,
        () =>
          [
            { id: '', values: { atk: 1, glad: 1 } },
            { id: '', values: { atk_: 1, clam: 1 } },
          ] as ArtifactBuildData[]
      ),
    }
    test('basic', () => {
      const node = sum(1, dynRead('atk'), prod(1500, dynRead('atk_')))
      const z = pruneAll([node], [-Infinity], arts, 5, {}, { reaffine: true })

      expect(z.nodes[0].operation).toEqual('read')
      expect(Object.keys(z.arts.base).length).toEqual(1)

      testFormulasEqual({ nodes: [node], arts }, z)
    })
    test('partial', () => {
      const node = sum(
        1,
        dynRead('atk'),
        prod(1500, dynRead('atk_')),
        threshold(dynRead('glad'), 2, 0.18, 0)
      )
      const z = pruneAll([node], [-Infinity], arts, 5, {}, { reaffine: true })

      expect(Object.keys(z.arts.base).length).toEqual(2)
      testFormulasEqual({ nodes: [node], arts }, z)
    })
  })
})

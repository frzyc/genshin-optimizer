import { objKeyMap } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact, ICachedWeapon } from '@genshin-optimizer/gi/db'
import type { Calculator } from '@genshin-optimizer/gi/formula'
import {
  artifactsData,
  charData,
  genshinCalculatorWithEntries,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { CreateSolverConfigArgs } from './index'
import {
  createOptimizeConfig,
  createSolverConfig,
  rainbowFilter,
  StatFilterTagToTag,
} from './index'

const SET_A = 'GladiatorsFinale' as ArtifactSetKey
const SET_B = 'WanderersTroupe' as ArtifactSetKey
const SET_C = 'NoblesseOblige' as ArtifactSetKey
const SET_D = 'CrimsonWitchOfFlames' as ArtifactSetKey
const SET_E = 'ViridescentVenerer' as ArtifactSetKey

function wep(id: string): ICachedWeapon {
  return {
    id,
    key: 'FavoniusGreatsword',
    level: 90,
    ascension: 6,
    refinement: 1,
    location: '',
    lock: false,
  } as ICachedWeapon
}

function art(
  id: string,
  slotKey: ArtifactSlotKey,
  setKey: ArtifactSetKey
): ICachedArtifact {
  return {
    id,
    slotKey,
    setKey,
    mainStatKey:
      slotKey === 'flower' ? 'hp' : slotKey === 'plume' ? 'atk' : 'atk_',
    mainStatVal: 100,
    substats: [],
    unactivatedSubstats: undefined,
    level: 20,
    rarity: 5,
    location: '',
    lock: false,
  } as ICachedArtifact
}

function emptyArts() {
  return objKeyMap(allArtifactSlotKeys, () => [] as ICachedArtifact[])
}

function args(
  partial: Partial<CreateSolverConfigArgs> &
    Pick<CreateSolverConfigArgs, 'weapons' | 'artsBySlot' | 'allowRainbow'>
): CreateSolverConfigArgs {
  return {
    calc: dummyCalc,
    frames: [{ tag: { qt: 'final', q: 'atk' }, multiplier: 1 }],
    statFilters: [],
    setFilter2: [],
    setFilter4: [],
    numWorkers: 1,
    numOfBuilds: 5,
    setProgress: () => {},
    ...partial,
  }
}

let dummyCalc: Calculator

beforeAll(() => {
  dummyCalc = genshinCalculatorWithEntries([
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData({
        key: 'Noelle',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      }),
      ...weaponData({
        key: 'FavoniusGreatsword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Noelle',
        lock: false,
      }),
      ...artifactsData([])
    ),
  ]).withTag({ src: '0' })
})

function accepted(filter: Set<string>[] | undefined, ids: string[]) {
  return !!filter?.some((group) => ids.every((id) => group.has(id)))
}

describe('gi pando solver', () => {
  test('six candidate columns; optWeapon false is a 1-weapon column', () => {
    const artsBySlot = emptyArts()
    for (const slot of allArtifactSlotKeys) {
      artsBySlot[slot].push(art(`${slot}-a`, slot, SET_A))
    }
    const cfg = createSolverConfig(
      args({
        allowRainbow: true,
        weapons: [wep('w1')],
        artsBySlot,
      })
    )
    expect(cfg.candidates).toHaveLength(6)
    expect(cfg.candidates[0]).toHaveLength(1)
    expect(cfg.candidates[0][0].id).toBe('w1')
    allArtifactSlotKeys.forEach((slot, i) => {
      expect(cfg.candidates[i + 1]).toHaveLength(1)
      expect(cfg.candidates[i + 1][0].id).toBe(`${slot}-a`)
    })
  })

  test('empty weapon or artifact slot disables generate', () => {
    const artsBySlot = emptyArts()
    for (const slot of allArtifactSlotKeys) {
      artsBySlot[slot].push(art(`${slot}-a`, slot, SET_A))
    }
    expect(
      createOptimizeConfig(
        args({ allowRainbow: true, weapons: [], artsBySlot })
      )
    ).toBeNull()

    const missingCirclet = emptyArts()
    for (const slot of allArtifactSlotKeys) {
      if (slot === 'circlet') continue
      missingCirclet[slot].push(art(`${slot}-a`, slot, SET_A))
    }
    expect(
      createOptimizeConfig(
        args({
          allowRainbow: true,
          weapons: [wep('w1')],
          artsBySlot: missingCirclet,
        })
      )
    ).toBeNull()
  })

  test('rainbow off keeps AAAAR and AAAAA, drops AABBC and RRRRR', () => {
    const artsBySlot = emptyArts()
    for (const slot of allArtifactSlotKeys) {
      artsBySlot[slot].push(art(`A-${slot}`, slot, SET_A))
      artsBySlot[slot].push(art(`B-${slot}`, slot, SET_B))
    }
    artsBySlot.circlet.push(art('C-circlet', 'circlet', SET_C))
    artsBySlot.flower.push(art('D-flower', 'flower', SET_D))
    artsBySlot.plume.push(art('E-plume', 'plume', SET_E))

    const cfg = args({
      allowRainbow: false,
      weapons: [wep('w1')],
      artsBySlot,
    })
    const filter = rainbowFilter(cfg)
    expect(filter?.length).toBeGreaterThan(0)

    const aaaar = [
      'w1',
      'A-flower',
      'A-plume',
      'A-sands',
      'A-goblet',
      'B-circlet',
    ]
    const aaaaa = [
      'w1',
      'A-flower',
      'A-plume',
      'A-sands',
      'A-goblet',
      'A-circlet',
    ]
    const aabbc = [
      'w1',
      'A-flower',
      'A-plume',
      'B-sands',
      'B-goblet',
      'C-circlet',
    ]
    const rrrrr = [
      'w1',
      'D-flower',
      'E-plume',
      'B-sands',
      'A-goblet',
      'C-circlet',
    ]

    expect(accepted(filter, aaaar)).toBe(true)
    expect(accepted(filter, aaaaa)).toBe(true)
    expect(accepted(filter, aabbc)).toBe(false)
    expect(accepted(filter, rrrrr)).toBe(false)

    const opt = createOptimizeConfig(cfg)
    expect(opt).not.toBeNull()
    expect(opt!.filter?.length).toBeGreaterThan(0)
  })

  test('rainbow on does not attach ID groups', () => {
    const artsBySlot = emptyArts()
    for (const slot of allArtifactSlotKeys) {
      artsBySlot[slot].push(art(`${slot}-a`, slot, SET_A))
    }
    const opt = createOptimizeConfig(
      args({
        allowRainbow: true,
        weapons: [wep('w1')],
        artsBySlot,
      })
    )
    expect(opt).not.toBeNull()
    expect(opt!.filter).toBeUndefined()
  })

  test('StatFilterTagToTag maps db tags onto formula own/agg reads', () => {
    expect(StatFilterTagToTag({ q: 'atk', qt: 'final' })).toEqual({
      et: 'own',
      sheet: 'agg',
      src: '0',
      q: 'atk',
      qt: 'final',
    })
    expect(
      StatFilterTagToTag({ q: 'dmg_', qt: 'final', ele: 'geo' })
    ).toMatchObject({
      q: 'dmg_',
      qt: 'final',
      ele: 'geo',
    })
    expect(
      StatFilterTagToTag({ q: 'atk', qt: 'final', ele: 'geo' })
    ).not.toHaveProperty('ele')
  })
})

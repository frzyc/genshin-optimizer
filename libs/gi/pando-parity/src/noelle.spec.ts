/**
 * Noelle WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 *   nx test gi-pando-parity
 */
import type { ICachedCharacter, ICachedWeapon } from '@genshin-optimizer/gi/db'
import {
  artifactsData,
  charData,
  conditionalEntries,
  enemyDebuff,
  genshinCalculatorWithEntries,
  own,
  ownBuff,
  teamData,
  weaponData,
  withMember,
  type TagMapNodeEntries,
} from '@genshin-optimizer/gi/formula'
import {
  allArtifactData,
  displayDataMap,
  getCharSheet,
  getWeaponSheet,
  reactionData,
  resonanceData,
} from '@genshin-optimizer/gi/sheets'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import type { Data, NumNode } from '@genshin-optimizer/gi/wr'
import {
  common,
  constant,
  dataObjForCharacter,
  dataObjForWeapon,
  input,
  mergeData,
} from '@genshin-optimizer/gi/wr'
import { relDiff } from './index'

const CHAR = {
  key: 'Noelle' as const,
  level: 80,
  talent: { auto: 8, skill: 8, burst: 8 },
  ascension: 6,
  constellation: 6,
}
const WEAPON = {
  key: 'FavoniusGreatsword' as const,
  level: 90,
  ascension: 6,
  refinement: 1,
  location: 'Noelle' as const,
  lock: false,
}

function buildWr(sweepingTime: boolean) {
  const character = {
    key: 'Noelle',
    level: CHAR.level,
    ascension: CHAR.ascension,
    constellation: CHAR.constellation,
    talent: { ...CHAR.talent },
    equippedArtifacts: {
      flower: '',
      plume: '',
      sands: '',
      goblet: '',
      circlet: '',
    },
    equippedWeapon: 'w-noelle',
  } as ICachedCharacter

  const weapon = {
    id: 'w-noelle',
    key: WEAPON.key,
    level: WEAPON.level,
    ascension: WEAPON.ascension,
    refinement: WEAPON.refinement,
    location: 'Noelle',
    lock: false,
  } as ICachedWeapon

  const characterSheet = getCharSheet('Noelle', 'F')
  if (!characterSheet) throw new Error('Missing Noelle WR sheet')
  const weaponSheet = getWeaponSheet(weapon.key)
  if (!weaponSheet) throw new Error(`Missing weapon sheet ${weapon.key}`)

  const weaponSheetsDataOfType =
    displayDataMap[getCharStat('Noelle').weaponType]
  const { display: _weaponDisplay, ...restWeaponSheetData } = weaponSheet.data
  const weaponSheetsData = mergeData([
    restWeaponSheetData,
    weaponSheetsDataOfType,
  ])

  const charObj = dataObjForCharacter(character)
  charObj.enemy = {
    ...(charObj.enemy as object),
    level: constant(90),
  } as Data['enemy']
  charObj.hit = {
    ...(charObj.hit as object),
    hitMode: constant('avgHit'),
  } as Data['hit']

  const conditionalLayer: Data = sweepingTime
    ? ({
        conditional: { Noelle: { SweepingTime: constant('on') } },
      } as Data)
    : {}

  const data: Data[] = [
    dataObjForWeapon(weapon),
    charObj,
    conditionalLayer,
    mergeData([characterSheet.data, weaponSheetsData, allArtifactData]),
    common,
    resonanceData,
    reactionData,
  ]
  return computeUIData(data)
}

function buildPando(sweepingTime: boolean) {
  const data: TagMapNodeEntries = [
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData(CHAR as never),
      ...weaponData(WEAPON as never),
      ...artifactsData([])
    ),
    ...(sweepingTime
      ? [conditionalEntries('Noelle', '0', null)('SweepingTime', 1)]
      : []),
    enemyDebuff.reaction.cata.add(''),
    enemyDebuff.reaction.amp.add(''),
    enemyDebuff.common.lvl.add(90),
    enemyDebuff.common.preRes.add(0.1),
    ownBuff.common.critMode.add('avg'),
  ]
  return genshinCalculatorWithEntries(data).withTag({ src: '0' })
}

describe('Noelle WR ↔ Pando finals', () => {
  test.each([
    false,
    true,
  ])('aligned finals (SweepingTime=%s)', (sweepingTime) => {
    const wr = buildWr(sweepingTime)
    const pando = buildPando(sweepingTime)

    const probes: [
      string,
      NumNode,
      'atk' | 'hp' | 'def' | 'eleMas' | 'critRate_' | 'critDMG_',
    ][] = [
      ['final.atk', input.total.atk, 'atk'],
      ['final.hp', input.total.hp, 'hp'],
      ['final.def', input.total.def, 'def'],
      ['final.eleMas', input.total.eleMas, 'eleMas'],
      ['final.critRate_', input.total.critRate_, 'critRate_'],
      ['final.critDMG_', input.total.critDMG_, 'critDMG_'],
    ]

    for (const [name, wrNode, pandoKey] of probes) {
      const wrVal = wr.get(wrNode).value as number
      const pandoVal = pando.compute((own.final as never)[pandoKey])
        .val as number
      expect(Number.isFinite(wrVal), name).toBe(true)
      expect(Number.isFinite(pandoVal), name).toBe(true)
      expect(
        relDiff(wrVal, pandoVal),
        `${name} wr=${wrVal} pando=${pandoVal}`
      ).toBeLessThan(1e-4)
    }

    // WR includes base 1.0 ER; Pando additive-only
    const wrEr = wr.get(input.total.enerRech_).value as number
    const pandoEr = pando.compute(own.final.enerRech_).val as number
    expect(relDiff(wrEr - 1, pandoEr)).toBeLessThan(1e-4)
  })
})

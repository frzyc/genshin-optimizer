import type {
  AscensionKey,
  CharacterKey,
  RefinementKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { StatKey } from '@genshin-optimizer/gi/dm'
import type { TagMapNodeEntries } from '@genshin-optimizer/gi/formula'
import {
  charData,
  convert,
  genshinCalculatorWithEntries,
  selfTag,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import { getCharStat } from '@genshin-optimizer/gi/stats'

export function getAscensionStat(id: CharacterKey) {
  return Object.keys(getCharStat(id).ascensionBonus)[3]
}

export function getFixed(key: StatKey) {
  return key.endsWith('_') ? 1 : 0
}

export function baseCharStats(
  id: CharacterKey,
  level = 90,
  ascension: AscensionKey = 6
) {
  const data: TagMapNodeEntries = [
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData({
        key: id,
        level: level,
        ascension: ascension,
        constellation: 0,
        talent: {
          auto: 1,
          skill: 1,
          burst: 1,
        },
      })
    ),
  ]
  const member0 = convert(selfTag, { src: '0', et: 'self' })
  const calc = genshinCalculatorWithEntries(data)
  const stats: Partial<Record<StatKey, number>> = {
    hp: calc.compute(member0.base.hp).val,
    atk: calc.compute(member0.base.atk).val,
    def: calc.compute(member0.base.def).val,
  }
  stats[getAscensionStat(id)] = calc.compute(
    calc.listFormulas(member0.listing.specialized)[0]
  ).val
  return stats
}

export function baseWeaponStats(
  id: WeaponKey,
  level = 90,
  ascension: AscensionKey = 6,
  refine: RefinementKey = 1
) {
  const data: TagMapNodeEntries = [
    ...withMember(
      '0',
      ...weaponData({
        key: id,
        level: level,
        ascension: ascension,
        refinement: refine,
        location: '',
        lock: false,
      })
    ),
  ]
  const member0 = convert(selfTag, { src: '0', et: 'self' })
  const calc = genshinCalculatorWithEntries(data)
  const stats: Partial<Record<StatKey, number>> = {
    atk: calc.compute(member0.base.atk).val,
  }
  return stats
}

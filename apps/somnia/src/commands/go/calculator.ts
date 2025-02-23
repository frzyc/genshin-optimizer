import {
  sheetKeyToCharKey,
  type AscensionKey,
  type CharacterSheetKey,
  type RefinementKey,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { StatKey } from '@genshin-optimizer/gi/dm'
import type { TagMapNodeEntries } from '@genshin-optimizer/gi/formula'
import {
  charData,
  convert,
  genshinCalculatorWithEntries,
  ownTag,
  tagToStat,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'

export function getFixed(key: StatKey) {
  return key.endsWith('_') ? 1 : 0
}

export function baseCharStats(
  id: CharacterSheetKey,
  level = 90,
  ascension: AscensionKey = 6
) {
  const data: TagMapNodeEntries = [
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData({
        key: sheetKeyToCharKey(id),
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
  const member0 = convert(ownTag, { et: 'own', src: '0' })
  const calc = genshinCalculatorWithEntries(data)
  const stats: Partial<Record<StatKey, number>> = {
    hp: calc.compute(member0.base.hp).val,
    atk: calc.compute(member0.base.atk).val,
    def: calc.compute(member0.base.def).val,
  }
  const specialized = calc.compute(member0.char.specialized)
  stats[tagToStat(specialized.meta.tag!)] = specialized.val
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
  const member0 = convert(ownTag, { et: 'own', src: '0' })
  const calc = genshinCalculatorWithEntries(data)
  const stats: Partial<Record<StatKey, number>> = {
    atk: calc.compute(member0.base.atk).val,
  }
  return stats
}

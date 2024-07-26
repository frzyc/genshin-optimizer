import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { StatKey } from '@genshin-optimizer/gi/dm'
import type { TagMapNodeEntries } from '@genshin-optimizer/gi/formula'
import {
  charData,
  convert,
  genshinCalculatorWithEntries,
  selfTag,
  teamData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import { getCharStat } from '@genshin-optimizer/gi/stats'

export function getAscensionStat(id: CharacterKey) {
  return Object.keys(getCharStat(id).ascensionBonus)[3]
}

export function getFixed(key: StatKey) {
  return key.endsWith('_') ? 1 : 0
}

export function baseStats(id: CharacterKey) {
  const data: TagMapNodeEntries = [
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData({
        key: id,
        level: 90,
        ascension: 6,
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

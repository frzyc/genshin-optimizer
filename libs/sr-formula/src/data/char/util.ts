import {
  cmpEq,
  cmpGE,
  constant,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando'
import type { StatBoostKey, TypeKey } from '@genshin-optimizer/sr-consts'
import type {
  CharacterDataGen,
  SkillTreeNodeBonusStat,
} from '@genshin-optimizer/sr-stats'
import { self, selfBuff, type TagMapNodeEntries } from '../util'

export function traceParams(data_gen: CharacterDataGen) {
  const [normal, skill, ult, talent, technique] = data_gen.skillTreeList
    .map((s) => s.skillParamList)
    .filter((s): s is number[][] => !!s)
  return {
    normal,
    skill,
    ult,
    talent,
    technique,
  }
}

export function entriesForChar(data_gen: CharacterDataGen): TagMapNodeEntries {
  const { final: _final, char } = self
  const { eidolon, ascension } = char
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl 1
  const readLvl = sum(constant(-1), self.char.lvl)
  const statBoosts = data_gen.skillTreeList
    .map((s) => s.levels?.[0]?.stats)
    .filter((s): s is SkillTreeNodeBonusStat => !!s)
  return [
    // Base stats
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = data_gen.ascension.map((p) => p[sk].base)
      const addPerAsc = data_gen.ascension.map((p) => p[sk].add)
      return selfBuff.base[sk].add(
        sum(
          subscript(ascension, basePerAsc),
          prod(readLvl, subscript(ascension, addPerAsc))
        )
      )
    }),
    ...(['crit_', 'crit_dmg_', 'spd'] as const).map((sk) => {
      const statAsc = data_gen.ascension.map((p) => p[sk])
      switch (sk) {
        case 'crit_':
        case 'crit_dmg_':
          return selfBuff.premod[sk].add(subscript(ascension, statAsc))
        case 'spd':
          return selfBuff.base[sk].add(subscript(ascension, statAsc))
      }
    }),
    // Small trace stat boosts
    ...statBoosts.flatMap((statBoost) =>
      Object.entries(statBoost).map(([key, amt], index) => {
        let stat
        switch (key) {
          case 'physical_dmg_':
          case 'fire_dmg_':
          case 'ice_dmg_':
          case 'wind_dmg_':
          case 'lightning_dmg_':
          case 'quantum_dmg_':
          case 'imaginary_dmg_':
            // substring will fetch 'physical' from 'physical_dmg_', for example
            stat =
              selfBuff.premod.dmg_[
                key.substring(0, key.indexOf('_')) as TypeKey
              ]
            break
          default:
            stat = selfBuff.premod[key]
            break
        }
        return stat.add(
          cmpEq(char[`statBoost${(index + 1) as StatBoostKey}`], 1, amt)
        )
      })
    ),
    // Eidolon 3 and 5 ability level boosts
    ...([3, 5] as const).flatMap((ei) =>
      Object.entries(data_gen.rankMap[3].skillTypeAddLevel).map(
        ([abilityKey, levelBoost]) =>
          selfBuff.char[abilityKey].add(cmpGE(eidolon, ei, levelBoost))
      )
    ),
  ]
}

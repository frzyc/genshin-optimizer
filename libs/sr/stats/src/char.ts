import type { CharacterKey, StatBoostKey } from '@genshin-optimizer/sr/consts'
import type { Rank } from '@genshin-optimizer/sr/dm'
import { allStats } from './allStats'

export function getCharStat(ck: CharacterKey) {
  return allStats.char[ck]
}

/**
 * Creates an interpolation object for i18n'ing the datamined strings with the proper numeric values for character traces
 * @param ck Character key
 * @param skType Skill tree type
 * @param skLevel Level of skill to lookup. If skType is 'eidolon', this is the eidolon to look up (1-6).
 * @param skIndex (optional) Which skill to use from this skill tree type. For niche cases, like Firefly who has multiple 'basic's
 * @returns Interpolation object to be fed to translate function
 */
export function getCharInterpolateObject(
  ck: CharacterKey,
  skType:
    | 'basic'
    | 'skill'
    | 'ult'
    | 'talent'
    | 'technique'
    | 'eidolon'
    | 'bonusAbility1'
    | 'bonusAbility2'
    | 'bonusAbility3',
  skLevel: number,
  skIndex = 0
) {
  if (skType === 'eidolon') {
    return Object.fromEntries(
      allStats.char[ck].rankMap[skLevel as Rank].params.map((param, index) => [
        index + 1,
        param,
      ])
    )
  } else {
    return Object.fromEntries(
      allStats.char[ck].skillTree[skType].skillParamList[skIndex].map(
        (skills, index) => [index + 1, skills[skLevel]]
      )
    )
  }
}

export function getCharStatBoostStatKey(
  ck: CharacterKey,
  bonusStats: StatBoostKey | `${StatBoostKey}`
) {
  return getCharStatBoostStat(ck, bonusStats).statKey
}

export function getCharStatBoostStatValue(
  ck: CharacterKey,
  bonusStats: StatBoostKey | `${StatBoostKey}`
) {
  return getCharStatBoostStat(ck, bonusStats).value
}

export function getCharStatBoostStat(
  ck: CharacterKey,
  bonusStats: StatBoostKey | `${StatBoostKey}`
) {
  const boost = getCharStatBoost(ck, bonusStats)
  const levels = boost.levels
  if (!levels?.length) {
    throw new Error(`No stat boost levels found for character ${ck}`)
  }
  const entries = Object.entries(levels[0].stats ?? {})
  if (!entries.length) {
    throw new Error(`No stats found in stat boost for character ${ck}`)
  }
  const [statKey, value] = entries[0]
  return { statKey, value }
}
export function getCharStatBoost(
  ck: CharacterKey,
  bonusStats: StatBoostKey | `${StatBoostKey}`
) {
  const { skillTree } = getCharStat(ck)
  return skillTree[`statBoost${bonusStats}`]
}

import { objMap } from '@genshin-optimizer/common/util'
import type { CharacterDatum } from '../..'

/**
 * Returns simple `number` arrays representing scalings of a character's traces
 * @param data_gen Character's entire `data` object from sr-stats:allStats
 * @returns Object with entry for basic, skill, ult, talent, technique and eidolon scalings. Eidolon contains further entries 1-6 for each eidolon.
 */
export function scalingParams(data_gen: CharacterDatum) {
  const {
    basic,
    skill,
    ult,
    talent,
    technique,
    bonusAbility1,
    bonusAbility2,
    bonusAbility3,
  } = data_gen.skillTree
  const eidolon = objMap(data_gen.rankMap, (rankInfo) => rankInfo.params)

  return {
    basic: basic.skillParamList,
    skill: skill.skillParamList,
    ult: ult.skillParamList,
    talent: talent.skillParamList,
    // Assume only 1 technique
    // Technique only has one level, so we can simplify the array.
    technique: technique.skillParamList[0].map((params) => params[0]),
    // Only 1 bonus ability skill config, and only 1 level
    bonusAbility1: bonusAbility1.skillParamList[0][0],
    bonusAbility2: bonusAbility2.skillParamList[0][0],
    bonusAbility3: bonusAbility3.skillParamList[0][0],
    eidolon,
  }
}

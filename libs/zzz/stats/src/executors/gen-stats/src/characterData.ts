import {
  nameToKey,
  notEmpty,
  objMap,
  transposeArray,
  verifyObjKeys,
} from '@genshin-optimizer/common/util'
import { type CharacterKey, allSkillKeys } from '@genshin-optimizer/zzz/consts'
import type { CharacterData } from '@genshin-optimizer/zzz/dm'
import {
  charactersDetailedJSONData,
  filterUnbuffedKits,
  hakushinSkillMap,
} from '@genshin-optimizer/zzz/dm'
import { type CharacterDatum } from '../../../char'
import { extractParamsFromString } from './util'

export type CharactersData = Record<CharacterKey, CharacterDatum>
export function getCharactersData(): CharactersData {
  return objMap(
    charactersDetailedJSONData,
    ({
      id,
      rarity,
      attribute,
      specialty,
      faction,
      stats,
      promotionStats,
      coreStats,
      skills,
      cores,
      mindscapes,
    }) => {
      const skillParams = extractSkillParams(skills)
      const calcedParams = extractCalcedParams(skills)
      const coreParams = extractCoreParams(cores)
      const abilityParams = extractAbilityParams(cores)
      const mindscapeParams = extraMindscapeParams(mindscapes)

      return {
        id,
        rarity,
        attribute,
        specialty,
        faction,
        stats,
        promotionStats,
        coreStats,
        skillParams,
        calcedParams,
        coreParams,
        abilityParams,
        mindscapeParams,
      }
    }
  )
}

function extractSkillParams(skills: CharacterData['skills']) {
  const skillParams = Object.fromEntries(
    Object.entries(skills).map(([key, skill]) => {
      return [
        hakushinSkillMap[key],
        Object.fromEntries(
          skill.Description.filter(filterUnbuffedKits).map((desc) => {
            // Only record each skill once.
            // Many skills show up twice, e.g. once for dmg, once for daze
            // But we have all the dmg, daze, anom info in the params
            const ids: Record<string, boolean> = {}
            return [
              nameToKey(desc.Name),
              (desc.Param ?? []).filter(filterUnbuffedKits).flatMap((par) =>
                Object.entries(par.Param ?? {})
                  .map(
                    ([
                      id,
                      {
                        DamagePercentage,
                        DamagePercentageGrowth,
                        StunRatio,
                        StunRatioGrowth,
                        SpRecovery,
                        SpRecoveryGrowth,
                        FeverRecovery,
                        FeverRecoveryGrowth,
                        AttributeInfliction,
                      },
                    ]) => {
                      if (!ids[id]) {
                        ids[id] = true
                        return {
                          DamagePercentage,
                          DamagePercentageGrowth,
                          StunRatio,
                          StunRatioGrowth,
                          SpRecovery,
                          SpRecoveryGrowth,
                          FeverRecovery,
                          FeverRecoveryGrowth,
                          AttributeInfliction,
                        }
                      }
                      return undefined
                    }
                  )
                  .filter(notEmpty)
              ),
            ]
          })
        ),
      ]
    })
  )
  verifyObjKeys(skillParams, allSkillKeys)
  return skillParams
}

const avatarSkillLevelIndexing = [
  'basicLevel',
  'specialLevel',
  'dodgeLevel',
  'chainLevel',
  'assistLevel',
]
function extractCalcedParams(skills: CharacterData['skills']) {
  const calcedParams = Object.fromEntries(
    Object.entries(skills).map(([key, skill]) => {
      return [
        hakushinSkillMap[key],
        Object.fromEntries(
          skill.Description.map((desc) => {
            return [
              nameToKey(desc.Name),
              (desc.Param ?? [])
                .map((par) =>
                  par.Desc.includes('{CAL:')
                    ? {
                        formula: par.Desc.replace(
                          /AvatarSkillLevel\((\d)\)/g,
                          (_match, index) =>
                            avatarSkillLevelIndexing[parseInt(index)]
                        ),
                      }
                    : undefined
                )
                .filter(notEmpty),
            ]
          })
        ),
      ]
    })
  )
  verifyObjKeys(calcedParams, allSkillKeys)
  return calcedParams
}

function extractCoreParams(cores: CharacterData['cores']) {
  return transposeArray(
    Object.values(cores.Level)
      .filter(filterUnbuffedKits)
      .map(({ Desc }) =>
        // Janky override for Qingyi inconsistent text
        extractParamsFromString(
          Desc[0].replace(
            'the Finishing Move will apply 1 extra stack of',
            'the Finishing Move will apply an extra stack of'
          )
        )
      )
  )
}

function extractAbilityParams(cores: CharacterData['cores']) {
  return extractParamsFromString(
    Object.values(cores.Level).filter(filterUnbuffedKits)[1].Desc[1]
  )
}

function extraMindscapeParams(mindscapes: CharacterData['mindscapes']) {
  return Object.values(mindscapes).map(({ Desc }) =>
    extractParamsFromString(Desc)
  )
}

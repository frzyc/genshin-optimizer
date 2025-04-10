import {
  nameToKey,
  notEmpty,
  objMap,
  verifyObjKeys,
} from '@genshin-optimizer/common/util'
import { type CharacterKey, allSkillKeys } from '@genshin-optimizer/zzz/consts'
import {
  charactersDetailedJSONData,
  hakushinSkillMap,
} from '@genshin-optimizer/zzz/dm'
import { type CharacterDatum } from '../../../char'

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
    }) => {
      const skillParams = Object.fromEntries(
        Object.entries(skills).map(([key, skill]) => {
          // Only record each skill once.
          // Many skills show up twice, e.g. once for dmg, once for daze
          // But we have all the dmg, daze, anom info in the params
          const ids: Record<string, boolean> = {}
          return [
            hakushinSkillMap[key],
            Object.fromEntries(
              skill.Description.map((desc) => [
                nameToKey(desc.Name),
                (desc.Param ?? []).flatMap((par) =>
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
              ])
            ),
          ]
        })
      )
      verifyObjKeys(skillParams, allSkillKeys)

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
      }
    }
  )
}

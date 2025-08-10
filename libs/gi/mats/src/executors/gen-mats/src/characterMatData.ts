import { layeredAssignment, nameToKey } from '@genshin-optimizer/common/util'
import type { AscensionKey, CharacterKey } from '@genshin-optimizer/gi/consts'
import type {
  AscensionRecord,
  AvatarSkillDepotExcelConfigData,
  CharacterId,
  ProudSkillExcelConfigData,
} from '@genshin-optimizer/gi/dm'
import {
  TextMapEN,
  ascensionData,
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  characterIdMap,
  materialExcelConfigData,
  proudSkillExcelConfigData,
} from '@genshin-optimizer/gi/dm'
import type { UpgradeCost } from '.'
import * as somniaData from './Somnia/data.json'

export type CharacterMatDataGen = {
  ascension: Record<AscensionKey, UpgradeCost>
  talents: {
    normal: Record<number, UpgradeCost>
    skill: Record<number, UpgradeCost>
    burst: Record<number, UpgradeCost>
  }
}

export type CharacterMatDatas = Record<CharacterKey, CharacterMatDataGen>

export default function characterMatData(): CharacterMatDatas {
  const data = {} as CharacterMatDatas

  function genMats(
    keys: string[],
    depot: AvatarSkillDepotExcelConfigData,
    ascensionData: AscensionRecord
  ) {
    const {
      energySkill: burst,
      skills: [normal, skill],
    } = depot

    const talents = [...keys, 'talents']
    const ascension = [...keys, 'ascension']

    function genTalents(keys: string[], skillArr: ProudSkillExcelConfigData[]) {
      const levels = Object.fromEntries(
        skillArr.map((skill) => [
          skill.level,
          {
            items: skill.costItems
              ?.filter((item) => {
                if (
                  'id' in item &&
                  'count' in item &&
                  item.id !== 0 &&
                  item.count !== 0
                ) {
                  return true
                }
                return false
              })
              .map((item) => ({
                item: nameToKey(
                  TextMapEN[materialExcelConfigData[item.id].nameTextMapHash]
                ),
                amount: item.count,
              })),
            cost: skill.coinCost ?? 0,
          },
        ])
      )
      layeredAssignment(data, keys, levels)
    }

    genTalents(
      [...talents, 'normal'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[normal].proudSkillGroupId
      ]
    )
    genTalents(
      [...talents, 'skill'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[skill].proudSkillGroupId
      ]
    )
    genTalents(
      [...talents, 'burst'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[burst].proudSkillGroupId
      ]
    )

    const ascensionLevels: Record<number, UpgradeCost> = Object.fromEntries(
      ascensionData.map((asc) => [
        asc.promoteLevel as AscensionKey,
        {
          cost: asc.scoinCost,
          items: asc.costItems
            ?.filter((item) => {
              if (
                'id' in item &&
                'count' in item &&
                item.id !== 0 &&
                item.count !== 0
              ) {
                return true
              }
              return false
            })
            .map((item) => {
              return {
                item: nameToKey(
                  TextMapEN[materialExcelConfigData[item.id].nameTextMapHash]
                ),
                amount: item.count,
              }
            }),
        },
      ])
    )

    layeredAssignment(data, ascension, ascensionLevels)
  }

  Object.entries(avatarExcelConfigData).forEach(([ci, charData]) => {
    const charId: CharacterId = ci as unknown as CharacterId
    const { candSkillDepotIds, skillDepotId, avatarPromoteId } = charData
    const ascension = ascensionData[avatarPromoteId]

    if (candSkillDepotIds.length) {
      const [_1, pyro, hydro, anemo, _5, geo, electro, dendro] =
        candSkillDepotIds

      genMats(
        ['TravelerAnemo'],
        avatarSkillDepotExcelConfigData[anemo],
        ascension
      )
      genMats(['TravelerGeo'], avatarSkillDepotExcelConfigData[geo], ascension)
      genMats(
        ['TravelerElectro'],
        avatarSkillDepotExcelConfigData[electro],
        ascension
      )
      genMats(
        ['TravelerDendro'],
        avatarSkillDepotExcelConfigData[dendro],
        ascension
      )
      genMats(
        ['TravelerHydro'],
        avatarSkillDepotExcelConfigData[hydro],
        ascension
      )
      genMats(
        ['TravelerPyro'],
        avatarSkillDepotExcelConfigData[pyro],
        ascension
      )
    } else {
      genMats(
        [characterIdMap[charId]],
        avatarSkillDepotExcelConfigData[skillDepotId],
        ascension
      )
    }
  })

  data.Somnia = somniaData as CharacterMatDataGen

  return data as CharacterMatDatas
}

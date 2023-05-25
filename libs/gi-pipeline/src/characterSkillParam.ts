import type { NonTravelerCharacterKey } from '@genshin-optimizer/consts'
import type {
  AvatarSkillDepotExcelConfigData,
  CharacterId,
  ProudSkillExcelConfigData,
} from '@genshin-optimizer/dm'
import {
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  avatarTalentExcelConfigData,
  characterIdMap,
  proudSkillExcelConfigData,
} from '@genshin-optimizer/dm'
import { extrapolateFloat } from '@genshin-optimizer/pipeline'
import { layeredAssignment } from '@genshin-optimizer/util'
import somniaData from './Somnia/skillParam.json'

type CharacterSkillParams = {
  auto: number[][]
  skill: number[][]
  burst: number[][]
  sprint?: number[][]
  passive?: number[][]
  passive1: number[][]
  passive2: number[][]
  passive3?: number[][] //Travelers don't have passive3s
  constellation1: number[]
  constellation2: number[]
  constellation3: number[]
  constellation4: number[]
  constellation5: number[]
  constellation6: number[]
}

type SKillParamCharacterKey =
  | NonTravelerCharacterKey
  | 'TravelerAnemoF'
  | 'TravelerAnemoM'
  | 'TravelerDendroF'
  | 'TravelerDendroM'
  | 'TravelerElectroF'
  | 'TravelerElectroM'
  | 'TravelerGeoF'
  | 'TravelerGeoM'
export type SkillParamData = Record<
  SKillParamCharacterKey,
  CharacterSkillParams
>

export default function characterSkillParam() {
  const characterSkillParamDump = {} as SkillParamData
  function genTalentHash(
    keys: string[],
    depot: AvatarSkillDepotExcelConfigData
  ) {
    const {
      energySkill: burst,
      skills: [normal, skill, sprint],
      talents,
      inherentProudSkillOpens: [passive1, passive2, passive3, , passive],
    } = depot

    function parseSkillParams(
      keys: string[],
      skillArr: ProudSkillExcelConfigData[]
    ) {
      const skillParamBase = skillArr.map((proud) => proud.paramList)

      //need to transpose the skillParam
      const skillParamUntrimmed: Array<Array<number>> = []
      skillParamBase.forEach((arr, i) => {
        arr.forEach((value, j) => {
          if (!skillParamUntrimmed[j]) skillParamUntrimmed[j] = []
          //The assumption is that any value >10 is a "flat" value that is not a percent.
          skillParamUntrimmed[j][i] = extrapolateFloat(value)
        })
      })
      //filter out empty entries
      const skillParam = skillParamUntrimmed.filter(
        (arr) => !arr.every((i) => !i)
      )
      layeredAssignment(characterSkillParamDump, keys, skillParam)
    }
    parseSkillParams(
      [...keys, 'auto'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[normal].proudSkillGroupId
      ]
    )

    parseSkillParams(
      [...keys, 'skill'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[skill].proudSkillGroupId
      ]
    )
    parseSkillParams(
      [...keys, 'burst'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[burst].proudSkillGroupId
      ]
    )

    if (sprint)
      parseSkillParams(
        [...keys, 'sprint'],
        proudSkillExcelConfigData[
          avatarSkillExcelConfigData[sprint].proudSkillGroupId
        ]
      )

    passive1.proudSkillGroupId &&
      parseSkillParams(
        [...keys, 'passive1'],
        proudSkillExcelConfigData[passive1.proudSkillGroupId]
      )
    passive2.proudSkillGroupId &&
      parseSkillParams(
        [...keys, 'passive2'],
        proudSkillExcelConfigData[passive2.proudSkillGroupId]
      )
    if (passive3?.proudSkillGroupId)
      parseSkillParams(
        [...keys, 'passive3'],
        proudSkillExcelConfigData[passive3.proudSkillGroupId]
      )
    //seems to be only used by sangonomiyaKokomi
    if (passive?.proudSkillGroupId)
      parseSkillParams(
        [...keys, 'passive'],
        proudSkillExcelConfigData[passive.proudSkillGroupId]
      )

    talents.forEach((skId, i) =>
      layeredAssignment(
        characterSkillParamDump,
        [...keys, `constellation${i + 1}`],
        avatarTalentExcelConfigData[skId].paramList
          .filter((i) => i)
          .map((value) => extrapolateFloat(value))
      )
    )
  }
  Object.entries(avatarExcelConfigData).forEach(([ci, charData]) => {
    const charid: CharacterId = ci as unknown as CharacterId
    const { candSkillDepotIds, skillDepotId } = charData

    if (candSkillDepotIds.length) {
      //Traveler
      const [_1, _2, _3, anemo, _5, geo, electro, dendro] = candSkillDepotIds
      const gender = characterIdMap[charid] === 'TravelerF' ? 'F' : 'M'
      genTalentHash(
        ['TravelerAnemo' + gender],
        avatarSkillDepotExcelConfigData[anemo]
      )
      genTalentHash(
        ['TravelerGeo' + gender],
        avatarSkillDepotExcelConfigData[geo]
      )
      genTalentHash(
        ['TravelerElectro' + gender],
        avatarSkillDepotExcelConfigData[electro]
      )
      genTalentHash(
        ['TravelerDendro' + gender],
        avatarSkillDepotExcelConfigData[dendro]
      )
    } else {
      genTalentHash(
        [characterIdMap[charid]],
        avatarSkillDepotExcelConfigData[skillDepotId]
      )
    }
  })
  characterSkillParamDump.Somnia = somniaData as CharacterSkillParams
  return characterSkillParamDump
}

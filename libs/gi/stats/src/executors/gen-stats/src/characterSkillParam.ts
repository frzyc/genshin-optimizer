import {
  layeredAssignment,
  transposeArray,
} from '@genshin-optimizer/common/util'
import type { NonTravelerCharacterKey } from '@genshin-optimizer/gi/consts'
import type {
  AvatarSkillDepotExcelConfigData,
  CharacterId,
  ProudSkillExcelConfigData,
} from '@genshin-optimizer/gi/dm'
import {
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  avatarTalentExcelConfigData,
  characterIdMap,
  getHakushinCharData,
  hakushinChars,
  proudSkillExcelConfigData,
} from '@genshin-optimizer/gi/dm'
import * as somniaData from './Somnia/skillParam.json'

export type CharacterSkillParams = {
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

type SkillParamCharacterKey =
  | NonTravelerCharacterKey
  | 'TravelerAnemoF'
  | 'TravelerAnemoM'
  | 'TravelerDendroF'
  | 'TravelerDendroM'
  | 'TravelerElectroF'
  | 'TravelerElectroM'
  | 'TravelerGeoF'
  | 'TravelerGeoM'
  | 'TravelerHydroF'
  | 'TravelerHydroM'
  | 'TravelerPyroF'
  | 'TravelerPyroM'
export type SkillParamData = Record<
  SkillParamCharacterKey,
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
          skillParamUntrimmed[j][i] = value
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
          .map((value) => value)
      )
    )
  }
  Object.entries(avatarExcelConfigData).forEach(([ci, charData]) => {
    const charid: CharacterId = ci as unknown as CharacterId
    const { candSkillDepotIds, skillDepotId } = charData

    if (candSkillDepotIds.length) {
      //Traveler
      const [_1, pyro, hydro, anemo, _5, geo, electro, dendro] =
        candSkillDepotIds
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
      genTalentHash(
        ['TravelerHydro' + gender],
        avatarSkillDepotExcelConfigData[hydro]
      )
      genTalentHash(
        ['TravelerPyro' + gender],
        avatarSkillDepotExcelConfigData[pyro]
      )
    } else {
      genTalentHash(
        [characterIdMap[charid]],
        avatarSkillDepotExcelConfigData[skillDepotId]
      )
    }
  })
  characterSkillParamDump.Somnia = somniaData as CharacterSkillParams
  for (const key of hakushinChars) {
    characterSkillParamDump[key] = getDataFromHakushin(key)
  }
  return characterSkillParamDump
}

function getDataFromHakushin(key: NonTravelerCharacterKey) {
  const data = getHakushinCharData(key)

  const skillParams: CharacterSkillParams = {
    auto: convertSkillsPromoteParamToParams(data.Skills[0].Promote),
    skill: convertSkillsPromoteParamToParams(data.Skills[1].Promote),
    // Alternate sprint might be [2], burst always seems to be last
    burst: convertSkillsPromoteParamToParams(
      data.Skills[data.Skills.length - 1].Promote
    ),
    passive1: data.Passives[0].ParamList.map((val) => [val]),
    passive2: data.Passives[1].ParamList.map((val) => [val]),
    // Natlan passive might be [2]
    // TODO: passive might be last, add some handling if needed
    passive3: data.Passives[data.Passives.length - 1].ParamList.map((val) => [
      val,
    ]),
    constellation1: data.Constellations[0].ParamList,
    constellation2: data.Constellations[1].ParamList,
    constellation3: data.Constellations[2].ParamList,
    constellation4: data.Constellations[3].ParamList,
    constellation5: data.Constellations[4].ParamList,
    constellation6: data.Constellations[5].ParamList,
  }
  return skillParams
}

function convertSkillsPromoteParamToParams(
  skillsPromote: Record<string, { Param: number[] }>
) {
  return transposeArray(
    Object.values(skillsPromote).map((level) => level.Param)
  )
}

import type { CharacterKey, WeaponKey } from '@genshin-optimizer/consts'
import type {
  AvatarSkillDepotExcelConfigData,
  ProudSkillExcelConfigData,
} from '@genshin-optimizer/dm'
import {
  artifactMainstatData,
  artifactSubstatData,
  artifactSubstatRollCorrection,
  artifactSubstatRollData,
  ascensionData,
  avatarCurveExcelConfigData,
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  avatarTalentExcelConfigData,
  equipAffixExcelConfigData,
  fetterInfoExcelConfigData,
  materialExcelConfigData,
  nameToKey,
  proudSkillExcelConfigData,
  TextMapEN,
  weaponCurveExcelConfigData,
  weaponExcelConfigData,
  weaponPromoteExcelConfigData,
} from '@genshin-optimizer/dm'
import type {
  CharacterData,
  CharacterId,
  WeaponData,
} from '@genshin-optimizer/pipeline'
import {
  characterIdMap,
  dumpFile,
  extrapolateFloat,
  propTypeMap,
  QualityTypeMap,
  weaponIdMap,
  weaponMap,
} from '@genshin-optimizer/pipeline'
import { layeredAssignment } from '@genshin-optimizer/util'
import { FRONTEND_PATH } from './Util'

export default function loadValues() {
  //parse baseStat/ascension/basic data
  const characterDataDump = Object.fromEntries(
    Object.entries(avatarExcelConfigData).map(([charid, charData]) => {
      const {
        weaponType,
        qualityType,
        avatarPromoteId,
        hpBase,
        attackBase,
        defenseBase,
        propGrowCurves,
      } = charData
      const curves = Object.fromEntries(
        propGrowCurves.map(({ type, growCurve }) => [
          propTypeMap[type],
          growCurve,
        ])
      ) as CharacterData['curves']
      const { infoBirthDay, infoBirthMonth } = fetterInfoExcelConfigData[charid]
      const result: CharacterData = {
        weaponTypeKey: weaponMap[weaponType],
        base: { hp: hpBase, atk: attackBase, def: defenseBase },
        curves,
        birthday: { month: infoBirthMonth, day: infoBirthDay },
        star: QualityTypeMap[qualityType] ?? 5,
        ascensions: ascensionData[avatarPromoteId],
      }
      const charKey = characterIdMap[charid as unknown as CharacterId]
      return [charKey.startsWith('Traveler') ? 'Traveler' : charKey, result]
    })
  ) as Record<CharacterKey, CharacterData>

  //dump data file to respective character directory.
  Object.entries(characterDataDump).forEach(([characterKey, data]) =>
    dumpFile(
      `${FRONTEND_PATH}/app/Data/Characters/${characterKey}/data_gen.json`,
      data
    )
  )

  const characterSkillParamDump = {} as Record<CharacterKey, CharacterData>
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
  dumpFile(`${__dirname}/allChar_gen.json`, characterSkillParamDump)
  //dump data file to respective character directory.
  Object.entries(characterSkillParamDump).forEach(([characterKey, data]) =>
    dumpFile(
      `${FRONTEND_PATH}/app/Data/Characters/${characterKey}/skillParam_gen.json`,
      data
    )
  )

  const weaponDataDump = Object.fromEntries(
    Object.entries(weaponExcelConfigData).map(([weaponid, weaponData]) => {
      const { weaponType, rankLevel, weaponProp, skillAffix, weaponPromoteId } =
        weaponData
      const [main, sub] = weaponProp
      const [refinementDataId] = skillAffix
      const refData =
        refinementDataId && equipAffixExcelConfigData[refinementDataId]

      const ascData = weaponPromoteExcelConfigData[weaponPromoteId]

      const result: WeaponData = {
        weaponType: weaponMap[weaponType],
        rarity: rankLevel,
        mainStat: {
          type: propTypeMap[main.propType],
          base: extrapolateFloat(main.initValue),
          curve: main.type,
        },
        subStat: sub.propType
          ? {
              type: propTypeMap[sub.propType],
              base: extrapolateFloat(sub.initValue),
              curve: sub.type,
            }
          : undefined,
        addProps: refData
          ? refData.map((asc) =>
              Object.fromEntries(
                asc.addProps
                  .filter((ap) => 'value' in ap)
                  .map((ap) => [
                    propTypeMap[ap.propType] ?? ap.propType,
                    extrapolateFloat(ap.value),
                  ])
              )
            )
          : [],
        ascension: ascData.map((asd) => {
          if (!asd) return { addStats: {} }
          return {
            addStats: Object.fromEntries(
              asd.addProps
                .filter((a) => a.value && a.propType)
                .map((a) => [
                  propTypeMap[a.propType],
                  extrapolateFloat(a.value),
                ])
            ),
          }
        }) as any,
      }
      return [weaponIdMap[weaponid], result]
    })
  ) as Record<WeaponKey, WeaponData>

  //dump data file to respective weapon directory.
  Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
    dumpFile(
      `${FRONTEND_PATH}/app/Data/Weapons/${
        data.weaponType[0].toUpperCase() + data.weaponType.slice(1)
      }/${weaponKey}/data_gen.json`,
      data
    )
  )

  //exp curve to generate  stats at every level
  dumpFile(
    `${FRONTEND_PATH}/app/Data/Weapons/expCurve_gen.json`,
    weaponCurveExcelConfigData
  )
  dumpFile(
    `${FRONTEND_PATH}/app/Data/Characters/expCurve_gen.json`,
    avatarCurveExcelConfigData
  )

  //dump artifact data
  dumpFile(
    `${FRONTEND_PATH}/app/Data/Artifacts/artifact_sub_gen.json`,
    artifactSubstatData
  )
  dumpFile(
    `${FRONTEND_PATH}/app/Data/Artifacts/artifact_main_gen.json`,
    artifactMainstatData
  )
  dumpFile(
    `${FRONTEND_PATH}/app/Data/Artifacts/artifact_sub_rolls_gen.json`,
    artifactSubstatRollData
  )
  dumpFile(
    `${FRONTEND_PATH}/app/Data/Artifacts/artifact_sub_rolls_correction_gen.json`,
    artifactSubstatRollCorrection
  )

  //generate the MapHashes for localization for materials
  const materialData = {}
  Object.entries(materialExcelConfigData).forEach(([_id, material]) => {
    const { nameTextMapHash, materialType } = material
    const key = nameToKey(TextMapEN[nameTextMapHash])
    materialData[key] = {
      type: materialType,
    }
  })
  dumpFile(
    `${FRONTEND_PATH}/app/Data/Materials/material_gen.json`,
    materialData
  )
}

import { artifactMainstatData, artifactSubstatData, artifactSubstatRollCorrection, artifactSubstatRollData, ascensionData, avatarExcelConfigData, AvatarSkillDepotExcelConfigData, characterExpCurve, characterInfo, constellations, equipAffixExcelConfigData, materialExcelConfigData, nameToKey, ProudSkillExcelConfigData, skillDepot, skillGroups, talentsData, TextMapEN, weaponCurveExcelConfigData, weaponExcelConfigData, weaponPromoteExcelConfigData } from '@genshin-optimizer/dm'
import { CharacterData, CharacterId, characterIdMap, CharacterKey, dumpFile, extrapolateFloat, propTypeMap, QualityTypeMap, WeaponData, weaponIdMap, WeaponKey, weaponMap } from '@genshin-optimizer/pipeline'
import { layeredAssignment } from '@genshin-optimizer/util'
import { FRONTEND_PATH } from './Util'

export default function loadValues() {

  //parse baseStat/ascension/basic data
  const characterDataDump = Object.fromEntries(Object.entries(avatarExcelConfigData).map(([charid, charData]) => {
    const { weaponType, qualityType, avatarPromoteId, hpBase, attackBase, defenseBase, propGrowCurves } = charData
    const curves = Object.fromEntries(propGrowCurves.map(({ type, growCurve }) => [propTypeMap[type], growCurve])) as CharacterData["curves"]
    const { infoBirthDay, infoBirthMonth, } = characterInfo[charid]
    const result: CharacterData = {
      weaponTypeKey: weaponMap[weaponType],
      base: { hp: hpBase, atk: attackBase, def: defenseBase },
      curves,
      birthday: { month: infoBirthMonth, day: infoBirthDay },
      star: QualityTypeMap[qualityType] ?? 5,
      ascensions: ascensionData[avatarPromoteId]
    }
    const charKey = characterIdMap[charid as unknown as CharacterId]
    return [charKey.startsWith("Traveler") ? "Traveler" : charKey, result]
  })) as Record<CharacterKey, CharacterData>

  //dump data file to respective character directory.
  Object.entries(characterDataDump).forEach(([characterKey, data]) =>
    dumpFile(`${FRONTEND_PATH}/app/Data/Characters/${characterKey}/data_gen.json`, data))


  const characterSkillParamDump = {} as Record<CharacterKey, CharacterData>
  function genTalentHash(keys: string[], depot: AvatarSkillDepotExcelConfigData) {
    const { energySkill: burst, skills: [normal, skill, sprint], talents, inherentProudSkillOpens: [passive1, passive2, passive3, , passive] } = depot

    function parseSkillParams(keys: string[], skillArr: ProudSkillExcelConfigData[]) {
      const skillParamBase = skillArr.map(proud => proud.paramList)

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
      const skillParam = skillParamUntrimmed.filter(arr => !arr.every(i => !i))
      layeredAssignment(characterSkillParamDump, keys, skillParam)
    }
    parseSkillParams([...keys, "auto"], skillGroups[talentsData[normal].proudSkillGroupId])

    parseSkillParams([...keys, "skill"], skillGroups[talentsData[skill].proudSkillGroupId])
    parseSkillParams([...keys, "burst"], skillGroups[talentsData[burst].proudSkillGroupId])

    if (sprint)
      parseSkillParams([...keys, "sprint"], skillGroups[talentsData[sprint].proudSkillGroupId])

    passive1.proudSkillGroupId && parseSkillParams([...keys, "passive1"], skillGroups[passive1.proudSkillGroupId])
    passive2.proudSkillGroupId && parseSkillParams([...keys, "passive2"], skillGroups[passive2.proudSkillGroupId])
    if (passive3?.proudSkillGroupId)
      parseSkillParams([...keys, "passive3"], skillGroups[passive3.proudSkillGroupId])
    //seems to be only used by sangonomiyaKokomi
    if (passive?.proudSkillGroupId)
      parseSkillParams([...keys, "passive"], skillGroups[passive.proudSkillGroupId])

    talents.forEach((skId, i) =>
      layeredAssignment(characterSkillParamDump, [...keys, `constellation${i + 1}`], constellations[skId].paramList.filter(i => i).map(value => extrapolateFloat(value))))
  }
  Object.entries(avatarExcelConfigData).forEach(([ci, charData]) => {
    const charid: CharacterId = ci as unknown as CharacterId
    const { candSkillDepotIds, skillDepotId } = charData

    if (candSkillDepotIds.length) { //Traveler
      const [_1, _2, _3, anemo, _5, geo, electro, dendro] = candSkillDepotIds
      const gender = characterIdMap[charid] === "TravelerF" ? "F" : "M"
      genTalentHash(["TravelerAnemo" + gender], skillDepot[anemo])
      genTalentHash(["TravelerGeo" + gender], skillDepot[geo])
      genTalentHash(["TravelerElectro" + gender], skillDepot[electro])
      genTalentHash(["TravelerDendro" + gender], skillDepot[dendro])
    } else {
      genTalentHash([characterIdMap[charid]], skillDepot[skillDepotId])
    }
  })
  dumpFile(`${__dirname}/allChar_gen.json`, characterSkillParamDump)
  //dump data file to respective character directory.
  Object.entries(characterSkillParamDump).forEach(([characterKey, data]) =>
    dumpFile(`${FRONTEND_PATH}/app/Data/Characters/${characterKey}/skillParam_gen.json`, data))

  const weaponDataDump = Object.fromEntries(Object.entries(weaponExcelConfigData).map(([weaponid, weaponData]) => {
    const { weaponType, rankLevel, weaponProp, skillAffix, weaponPromoteId } = weaponData
    const [main, sub] = weaponProp
    const [refinementDataId,] = skillAffix
    const refData = refinementDataId && equipAffixExcelConfigData[refinementDataId]

    const ascData = weaponPromoteExcelConfigData[weaponPromoteId]

    const result: WeaponData = {
      weaponType: weaponMap[weaponType],
      rarity: rankLevel,
      mainStat: {
        type: propTypeMap[main.propType],
        base: extrapolateFloat(main.initValue),
        curve: main.type
      },
      subStat: sub.propType ? {
        type: propTypeMap[sub.propType],
        base: extrapolateFloat(sub.initValue),
        curve: sub.type
      } : undefined,
      addProps: refData ? refData.map(asc =>
        Object.fromEntries(asc.addProps.filter(ap => "value" in ap).map((ap) =>
          [propTypeMap[ap.propType] ?? ap.propType, extrapolateFloat(ap.value)]))
      ) : [],
      ascension: ascData.map(asd => {
        if (!asd) return { addStats: {} }
        return {
          addStats: Object.fromEntries(asd.addProps.filter(a => a.value && a.propType).map(a =>
            [propTypeMap[a.propType], extrapolateFloat(a.value)]))
        }
      }) as any
    }
    return [weaponIdMap[weaponid], result]
  })) as Record<WeaponKey, WeaponData>

  //dump data file to respective weapon directory.
  Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
    dumpFile(`${FRONTEND_PATH}/app/Data/Weapons/${data.weaponType[0].toUpperCase() + data.weaponType.slice(1)}/${weaponKey}/data_gen.json`, data))

  //exp curve to generate  stats at every level
  dumpFile(`${FRONTEND_PATH}/app/Data/Weapons/expCurve_gen.json`, weaponCurveExcelConfigData)
  dumpFile(`${FRONTEND_PATH}/app/Data/Characters/expCurve_gen.json`, characterExpCurve)

  //dump artifact data
  dumpFile(`${FRONTEND_PATH}/app/Data/Artifacts/artifact_sub_gen.json`, artifactSubstatData)
  dumpFile(`${FRONTEND_PATH}/app/Data/Artifacts/artifact_main_gen.json`, artifactMainstatData)
  dumpFile(`${FRONTEND_PATH}/app/Data/Artifacts/artifact_sub_rolls_gen.json`, artifactSubstatRollData)
  dumpFile(`${FRONTEND_PATH}/app/Data/Artifacts/artifact_sub_rolls_correction_gen.json`, artifactSubstatRollCorrection)

  //generate the MapHashes for localization for materials
  const materialData = {}
  Object.entries(materialExcelConfigData).forEach(([id, material]) => {
    const { nameTextMapHash, materialType } = material
    const key = nameToKey(TextMapEN[nameTextMapHash])
    materialData[key] = {
      type: materialType
    }
  })
  dumpFile(`${FRONTEND_PATH}/app/Data/Materials/material_gen.json`, materialData)
}

import { artifactIdMap, artifactSlotMap, characterIdMap, CharacterKey, Language, propTypeMap, QualityTypeMap, StatKey, weaponIdMap, WeaponKey, weaponMap, WeaponTypeKey } from '.'
import { mapHashData, mapHashDataOverride } from './Data'
import artifactMainstatData from './DataminedModules/artifact/artifactMainstat'
import artifactSubstatData from './DataminedModules/artifact/artifactSubstat'
import { artifactSubstatRollCorrection, artifactSubstatRollData } from './DataminedModules/artifact/artifactSubstatRolls'
import artifactPiecesData from './DataminedModules/artifact/ReliquaryExcelConfigData'
import reliquarySetExcelConfigData from './DataminedModules/artifact/ReliquarySetExcelConfigData'
import ascensionData from './DataminedModules/character/AvatarPromoteExcelConfigData'
import avatarExcelConfigData from './DataminedModules/character/AvatarExcelConfigData'
import characterExpCurve, { CharacterGrowCurveKey } from './DataminedModules/character/AvatarCurveExcelConfigData'
import characterInfo from './DataminedModules/character/characterInfo'
import constellations from './DataminedModules/character/constellations'
// import './DataminedModules/food/CookRecipeExcelConfigData'
import materialExcelConfigData from './DataminedModules/character/MaterialExcelConfigData'
import skillGroups, { ProudSkillExcelConfigData } from './DataminedModules/character/passives'
import skillDepot, { AvatarSkillDepotExcelConfigData } from './DataminedModules/character/skillDepot'
import talentsData from './DataminedModules/character/talents'
import equipAffixExcelConfigData from './DataminedModules/common/EquipAffixExcelConfigData'
import weaponCurveExcelConfigData, { WeaponGrowCurveKey } from './DataminedModules/weapon/WeaponCurveExcelConfigData'
import weaponExcelConfigData from './DataminedModules/weapon/WeaponExcelConfigData'
import weaponPromoteExcelConfigData from './DataminedModules/weapon/WeaponPromoteExcelConfigData'
import { extrapolateFloat } from './extrapolateFloat'
import loadImages from './loadImages'
import { parsingFunctions, preprocess } from './parseUtil'
import { languageMap, nameToKey, TextMapEN } from './TextMapUtil'
import { crawlObject, dumpFile, layeredAssignment } from './Util'

const fs = require('fs')

loadImages();

/* ####################################################
 * # Importing data from datamined files.
 */
export type CharacterData = {
  weaponTypeKey: WeaponTypeKey
  base: {
    hp: number,
    atk: number,
    def: number,
  },
  curves: {
    hp: CharacterGrowCurveKey,
    atk: CharacterGrowCurveKey,
    def: CharacterGrowCurveKey,
  },
  star: 1 | 2 | 3 | 4 | 5,
  ascensions: {
    props: { [key: string]: number }
  }[],
  birthday: {
    month?: number,
    day?: number
  }
}
//parse baseStat/ascension/basic data
const characterDataDump = Object.fromEntries(Object.entries(avatarExcelConfigData).filter(([charid, charData]) => charid in characterIdMap).map(([charid, charData]) => {
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
  const charKey = characterIdMap[charid]
  return [charKey.startsWith("Traveler") ? "Traveler" : charKey, result]
})) as Record<CharacterKey, CharacterData>

//dump data file to respective character directory.
Object.entries(characterDataDump).forEach(([characterKey, data]) =>
  dumpFile(`${__dirname}/../src/Data/Characters/${characterKey}/data_gen.json`, data))


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
Object.entries(avatarExcelConfigData).forEach(([charid, charData]) => {
  if (!(charid in characterIdMap)) return
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
  dumpFile(`${__dirname}/../src/Data/Characters/${characterKey}/skillParam_gen.json`, data))

type WeaponProp = {
  type: StatKey,
  base: number,
  curve: WeaponGrowCurveKey
}
export type WeaponData = {
  weaponType: WeaponTypeKey
  rarity: 1 | 2 | 3 | 4 | 5
  mainStat: WeaponProp
  subStat?: WeaponProp
  addProps: Partial<Record<StatKey, number>>[]
  ascension: { addStats: Partial<Record<StatKey, number>> }[]
}
const weaponDataDump = Object.fromEntries(Object.entries(weaponExcelConfigData).filter(([weaponid, weaponData]) => weaponid in weaponIdMap).map(([weaponid, weaponData]) => {
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
      Object.fromEntries(asc.addProps.filter(ap => "value" in ap).map((ap: any) =>
        [propTypeMap[ap.propType] ?? ap.propType, extrapolateFloat(ap.value)]))
    ) : [],
    ascension: ascData.map(asd => {
      if (!asd) return { addStats: {} }
      return {
        addStats: Object.fromEntries(asd.addProps.filter(a => a.value && a.propType).map(a => [
          propTypeMap[a.propType], extrapolateFloat(a.value)
        ]))
      }
    }) as any
  }
  return [weaponIdMap[weaponid], result]
})) as Record<WeaponKey, WeaponData>

//dump data file to respective weapon directory.
Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
  dumpFile(`${__dirname}/../src/Data/Weapons/${data.weaponType[0].toUpperCase() + data.weaponType.slice(1)}/${weaponKey}/data_gen.json`, data))

//exp curve to generate  stats at every level
dumpFile(`${__dirname}/../src/Data/Weapons/expCurve_gen.json`, weaponCurveExcelConfigData)
dumpFile(`${__dirname}/../src/Data/Characters/expCurve_gen.json`, characterExpCurve)

//dump artifact data
dumpFile(`${__dirname}/../src/Data/Artifacts/artifact_sub_gen.json`, artifactSubstatData)
dumpFile(`${__dirname}/../src/Data/Artifacts/artifact_main_gen.json`, artifactMainstatData)
dumpFile(`${__dirname}/../src/Data/Artifacts/artifact_sub_rolls_gen.json`, artifactSubstatRollData)
dumpFile(`${__dirname}/../src/Data/Artifacts/artifact_sub_rolls_correction_gen.json`, artifactSubstatRollCorrection)

//generate the MapHashes for localization for artifacts
Object.entries(reliquarySetExcelConfigData).filter(([setId, data]) => setId in artifactIdMap).forEach(([setId, data]) => {
  const { EquipAffixId, setNeedNum, containsList } = data
  if (!EquipAffixId) return

  const setEffects = Object.fromEntries(setNeedNum.map((setNeed, i) => {
    const equipAffixData = equipAffixExcelConfigData[EquipAffixId]?.[i]
    if (!equipAffixData) throw `No data for EquipAffixId ${EquipAffixId} for setEffect ${setNeed}`
    return [setNeed, equipAffixData.descTextMapHash]
  }))

  const pieces = Object.fromEntries(containsList.map(pieceId => {
    const pieceData = artifactPiecesData[pieceId]
    if (!pieceData) throw `No piece data with id ${pieceId} in setId ${setId}`
    const { equipType, nameTextMapHash, descTextMapHash } = pieceData
    return [artifactSlotMap[equipType], {
      name: nameTextMapHash,
      desc: descTextMapHash
    }]
  }))

  const setName = equipAffixExcelConfigData[EquipAffixId]?.[0]?.nameTextMapHash

  mapHashData.artifactNames[artifactIdMap[setId]] = setName
  mapHashData.artifact[artifactIdMap[setId]] = {
    setName,
    setEffects,
    pieces
  }
})

//generate the MapHashes for localization for weapons
Object.entries(weaponExcelConfigData).filter(([weaponid,]) => weaponid in weaponIdMap).forEach(([weaponid, weaponData]) => {
  const { nameTextMapHash, descTextMapHash, skillAffix } = weaponData
  const [ascensionDataId,] = skillAffix
  const ascData = ascensionDataId && equipAffixExcelConfigData[ascensionDataId]

  mapHashData.weaponNames[weaponIdMap[weaponid]] = nameTextMapHash
  mapHashData.weapon[weaponIdMap[weaponid]] = {
    name: nameTextMapHash,
    description: descTextMapHash,
    passiveName: ascData ? ascData[0].nameTextMapHash : 0,
    passiveDescription: ascData ? ascData.map(asc => asc.descTextMapHash) : [0, 0, 0, 0, 0],
  }
})

//generate the MapHashes for localization for characters
Object.entries(avatarExcelConfigData).filter(([charid,]) => charid in characterIdMap).forEach(([charid, charData]) => {
  const { nameTextMapHash, descTextMapHash, skillDepotId, candSkillDepotIds } = charData
  const { avatarTitleTextMapHash, avatarConstellationBeforTextMapHash } = characterInfo[charid]

  mapHashData.charNames[characterIdMap[charid]] = nameTextMapHash
  const charKey = characterIdMap[charid]
  layeredAssignment(mapHashData, ["char", charKey, "name"], nameTextMapHash)
  layeredAssignment(mapHashData, ["char", charKey, "title"], avatarTitleTextMapHash)
  layeredAssignment(mapHashData, ["char", charKey, "description"], descTextMapHash)
  // layeredAssignment(mapHashData, [...keys, "descriptionDetail"], avatarDetailTextMapHash)
  // Don't override constellation name if manually specified. For Zhongli
  !mapHashData.char[characterIdMap[charid]].constellationName && layeredAssignment(mapHashData, ["char", charKey, "constellationName"], avatarConstellationBeforTextMapHash)
  function genTalentHash(keys: string[], depot: AvatarSkillDepotExcelConfigData) {
    const { energySkill: burst, skills: [normal, skill, sprint], talents, inherentProudSkillOpens: [passive1, passive2, passive3, , passive] } = depot
    layeredAssignment(mapHashData, [...keys, "auto", "name"], [talentsData[normal].nameTextMapHash, "autoName"])
    layeredAssignment(mapHashData, [...keys, "auto", "fields"], [talentsData[normal].descTextMapHash, "autoFields"])
    layeredAssignment(mapHashData, [...keys, "auto", "skillParams"], skillGroups[talentsData[normal].proudSkillGroupId][0].paramDescList.map(id => [id, "skillParam"]))

    layeredAssignment(mapHashData, [...keys, "skill", "name"], talentsData[skill].nameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "skill", "description"], [talentsData[skill].descTextMapHash, "paragraph"])
    layeredAssignment(mapHashData, [...keys, "skill", "skillParams"], skillGroups[talentsData[skill].proudSkillGroupId][0].paramDescList.map(id => [id, "skillParam"]))

    layeredAssignment(mapHashData, [...keys, "burst", "name"], talentsData[burst].nameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "burst", "description"], [talentsData[burst].descTextMapHash, "paragraph"])
    layeredAssignment(mapHashData, [...keys, "burst", "skillParams"], skillGroups[talentsData[burst].proudSkillGroupId][0].paramDescList.map(id => [id, "skillParam"]))

    if (sprint) {
      layeredAssignment(mapHashData, [...keys, "sprint", "name"], talentsData[sprint].nameTextMapHash)
      layeredAssignment(mapHashData, [...keys, "sprint", "description"], [talentsData[sprint].descTextMapHash, "paragraph"])
    }

    passive1.proudSkillGroupId && layeredAssignment(mapHashData, [...keys, "passive1", "name"], skillGroups[passive1.proudSkillGroupId][0].nameTextMapHash)
    passive1.proudSkillGroupId && layeredAssignment(mapHashData, [...keys, "passive1", "description"], [skillGroups[passive1.proudSkillGroupId][0].descTextMapHash, "paragraph"])

    passive2.proudSkillGroupId && layeredAssignment(mapHashData, [...keys, "passive2", "name"], skillGroups[passive2.proudSkillGroupId][0].nameTextMapHash)
    passive2.proudSkillGroupId && layeredAssignment(mapHashData, [...keys, "passive2", "description"], [skillGroups[passive2.proudSkillGroupId][0].descTextMapHash, "paragraph"])

    if (passive3?.proudSkillGroupId) {
      layeredAssignment(mapHashData, [...keys, "passive3", "name"], skillGroups[passive3.proudSkillGroupId][0].nameTextMapHash)
      layeredAssignment(mapHashData, [...keys, "passive3", "description"], [skillGroups[passive3.proudSkillGroupId][0].descTextMapHash, "paragraph"])
    }
    //seems to be only used by SangonomiyaKokomi
    if (passive?.proudSkillGroupId) {
      layeredAssignment(mapHashData, [...keys, "passive", "name"], skillGroups[passive.proudSkillGroupId][0].nameTextMapHash)
      layeredAssignment(mapHashData, [...keys, "passive", "description"], [skillGroups[passive.proudSkillGroupId][0].descTextMapHash, "paragraph"])
    }

    talents.forEach((skId, i) => {
      layeredAssignment(mapHashData, [...keys, `constellation${i + 1}`, "name"], constellations[skId].nameTextMapHash)
      layeredAssignment(mapHashData, [...keys, `constellation${i + 1}`, "description"], [constellations[skId].descTextMapHash, "paragraph"])
    })
  }

  if (candSkillDepotIds.length) { //Traveler
    const [_1, _2, _3, anemo, _5, geo, electro, dendro] = candSkillDepotIds
    const gender = characterIdMap[charid] === "TravelerF" ? "F" : "M"
    genTalentHash(["char", "TravelerAnemo" + gender], skillDepot[anemo])
    genTalentHash(["char", "TravelerGeo" + gender], skillDepot[geo])
    genTalentHash(["char", "TravelerElectro" + gender], skillDepot[electro])
    genTalentHash(["char", "TravelerDendro" + gender], skillDepot[dendro])
  } else {
    genTalentHash(["char", charKey], skillDepot[skillDepotId])
  }
})

//generate the MapHashes for localization for materials
const materialData = {}
Object.entries(materialExcelConfigData).forEach(([id, material]) => {
  const { nameTextMapHash, descTextMapHash, materialType } = material
  const key = nameToKey(TextMapEN[nameTextMapHash])
  if (!key || mapHashData.material[key]) return
  mapHashData.material[key] = {
    name: nameTextMapHash,
    description: descTextMapHash,
  }
  materialData[key] = {
    type: materialType
  }
})
dumpFile(`${__dirname}/../src/Data/Materials/material_gen.json`, materialData)

mapHashDataOverride()

//Main localization dumping
const languageData = {}
Object.entries(languageMap).forEach(([lang, langStrings]) => {
  crawlObject(mapHashData, [], v => typeof v === "number" || v?.length === 2 && (Array.isArray(v) && typeof v[0] === "number" && typeof v[1] === "string"), (value, keys) => {
    // const [type, characterKey, skill, field] = keys
    if (value === 0) return layeredAssignment(languageData, [lang, ...keys], "")
    if (typeof value === "number") value = [value, "string"]
    const [stringID, processing] = value
    let rawString = langStrings[stringID]

    //manually fix bad strings that breaks pipeline, seem to be only in russian translations
    if (processing === "autoFields" && lang === "ru" && rawString.split("\\n\\n").length === 2) {
      const ind = rawString.indexOf("n<color=#FFD780FF>") + 1
      rawString = rawString.slice(0, ind) + ("\\n") + rawString.slice(ind);
    }
    const string = parsingFunctions[processing](lang as Language, preprocess(rawString), keys)
    if (string === undefined) throw (`Invalid string in ${keys}, for lang:${lang} (${stringID}:${processing})`)
    layeredAssignment(languageData, [lang, ...keys], string)
  })
})

//dump the language data to files
Object.entries(languageData).forEach(([lang, data]) => {
  const fileDir = `${__dirname}/../public/locales/${lang}`
  if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)

  Object.entries(data).forEach(([type, typeData]) => {
    //general manual localiation namespaces
    if (["sheet", "weaponKey", "elementalResonance", "material", "charNames", "weaponNames", "artifactNames"].includes(type))
      return dumpFile(`${fileDir}/${type}_gen.json`, typeData)

    //weapons/characters/artifacts
    Object.entries((typeData as any)).forEach(([itemKey, data]) =>
      dumpFile(`${fileDir}/${type}_${itemKey}_gen.json`, data))
  })
})

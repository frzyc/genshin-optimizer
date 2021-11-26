import { artifactIdMap, artifactSlotMap, characterIdMap, CharacterKey, DWeaponTypeKey, Language, propTypeMap, QualityTypeMap, StatKey, weaponIdMap, WeaponKey, weaponMap, WeaponTypeKey } from '.'
import { mapHashData } from './Data'
import artifactMainstatData from './DataminedModules/artifact/artifactMainstat'
import artifactPiecesData from './DataminedModules/artifact/ReliquaryExcelConfigData'
import reliquarySetExcelConfigData from './DataminedModules/artifact/ReliquarySetExcelConfigData'
import artifactSubstatData from './DataminedModules/artifact/artifactSubstat'
import { artifactSubstatRollCorrection, artifactSubstatRollData } from './DataminedModules/artifact/artifactSubstatRolls'
import ascensionData from './DataminedModules/character/ascension'
import avatarExcelConfigData from './DataminedModules/character/AvatarExcelConfigData'
import characterExpCurve, { CharacterGrowCurveKey } from './DataminedModules/character/characterExpCurve'
import characterInfo from './DataminedModules/character/characterInfo'
import constellations from './DataminedModules/character/constellations'
import skillGroups, { ProudSkillExcelConfigData } from './DataminedModules/character/passives'
import skillDepot, { AvatarSkillDepotExcelConfigData } from './DataminedModules/character/skillDepot'
import talents from './DataminedModules/character/talents'
import equipAffixExcelConfigData from './DataminedModules/common/EquipAffixExcelConfigData'
import weaponExcelConfigData from './DataminedModules/weapon/WeaponExcelConfigData'
import weaponPromoteExcelConfigData from './DataminedModules/weapon/WeaponPromoteExcelConfigData'
import weaponCurveExcelConfigData, { WeaponGrowCurveKey } from './DataminedModules/weapon/WeaponCurveExcelConfigData'
import { extrapolateFloat } from './extrapolateFloat'
import loadImages from './loadImages'
import { parsingFunctions, preprocess } from './parseUtil'
import { languageMap } from './TextMapUtil'
import { crawlObject, dumpFile, layeredAssignment } from './Util'

// import './DataminedModules/food/CookRecipeExcelConfigData'
// import './DataminedModules/material/MaterialExcelConfigData'
const fs = require('fs')

loadImages();

/* ####################################################
 * # Importing data from datamined files.
 */
export type CharacterData = {
  weaponTypeKey: DWeaponTypeKey
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
  star: number,
  ascensions: {
    props: { [key: string]: number }
  }[],
  birthday: {
    month: number,
    day: number
  }
}
//parse baseStat/ascension/basic data
const characterDataDump = Object.fromEntries(Object.entries(avatarExcelConfigData).filter(([charid, charData]) => charid in characterIdMap).map(([charid, charData]) => {
  const { WeaponType, QualityType, AvatarPromoteId, HpBase, AttackBase, DefenseBase, PropGrowCurves } = charData
  const curves = Object.fromEntries(PropGrowCurves.map(({ Type, GrowCurve }) => [propTypeMap[Type], GrowCurve])) as CharacterData["curves"]
  const { InfoBirthDay, InfoBirthMonth, } = characterInfo[charid]
  const result: CharacterData = {
    weaponTypeKey: weaponMap[WeaponType],
    base: { hp: HpBase, atk: AttackBase, def: DefenseBase },
    curves,
    birthday: { month: InfoBirthMonth, day: InfoBirthDay },
    star: QualityTypeMap[QualityType],
    ascensions: ascensionData[AvatarPromoteId]
  }

  return [characterIdMap[charid], result]
})) as Record<CharacterKey, CharacterData>

//dump data file to respective character directory.
Object.entries(characterDataDump).forEach(([characterKey, data]) => {
  if (characterKey.includes('_')) {//Traveler, for multi element support
    const [charKey, eleKey] = characterKey.split("_")
    dumpFile(`../src/Data/Characters/${charKey}/data_${eleKey}_gen.json`, data)
  } else
    dumpFile(`../src/Data/Characters/${characterKey}/data_gen.json`, data)
})


const characterSkillParamDump = Object.fromEntries(Object.entries(avatarExcelConfigData).filter(([charid, charData]) => charid in characterIdMap).map(([charid, charData]) => {
  const { CandSkillDepotIds, SkillDepotId } = charData
  const result = {}
  let skillDepotId = SkillDepotId


  function genTalentHash(keys: string[], depot: AvatarSkillDepotExcelConfigData) {
    const { EnergySkill: burst, Skills: [normal, skill, sprint], Talents, InherentProudSkillOpens: [passive1, passive2, passive3, , passive] } = depot

    function parseSkillParams(obj: object, keys: string[], skillArr: ProudSkillExcelConfigData[]) {
      const skillParamBase = skillArr.map(proud => proud.ParamList)

      //need to transpose the skillParam
      const skillParamUntrimmed = []
      skillParamBase.forEach((arr, i) => {
        arr.forEach((value, j) => {
          if (!skillParamUntrimmed[j]) skillParamUntrimmed[j] = []
          //The assumption is that any value >10 is a "flat" value that is not a percent.
          skillParamUntrimmed[j][i] = extrapolateFloat(value)
        })
      })
      //filter out empty entries
      const skillParam = skillParamUntrimmed.filter(arr => !arr.every(i => !i))
      layeredAssignment(result, keys, skillParam)
    }
    parseSkillParams(result, [...keys, "auto"], skillGroups[talents[normal].ProudSkillGroupId])

    parseSkillParams(result, [...keys, "skill"], skillGroups[talents[skill].ProudSkillGroupId])
    parseSkillParams(result, [...keys, "burst"], skillGroups[talents[burst].ProudSkillGroupId])

    if (sprint)
      parseSkillParams(result, [...keys, "sprint"], skillGroups[talents[sprint].ProudSkillGroupId])

    parseSkillParams(result, [...keys, "passive1"], skillGroups[passive1.ProudSkillGroupId])
    parseSkillParams(result, [...keys, "passive2"], skillGroups[passive2.ProudSkillGroupId])
    if (passive3?.ProudSkillGroupId)
      parseSkillParams(result, [...keys, "passive3"], skillGroups[passive3.ProudSkillGroupId])
    //seems to be only used by SangonomiyaKokomi
    if (passive?.ProudSkillGroupId)
      parseSkillParams(result, [...keys, "passive"], skillGroups[passive.ProudSkillGroupId])

    Talents.forEach((skId, i) =>
      layeredAssignment(result, [...keys, `constellation${i + 1}`], constellations[skId].ParamList.filter(i => i).map(value => extrapolateFloat(value))))
  }

  const keys = []
  if (CandSkillDepotIds.length) { //Traveler
    //this will be 504,506... for male
    genTalentHash([...keys, "anemo"], skillDepot[704])
    genTalentHash([...keys, "geo"], skillDepot[706])
    genTalentHash([...keys, "electro"], skillDepot[707])
  } else {
    genTalentHash(keys, skillDepot[skillDepotId])
  }


  return [characterIdMap[charid], result]
})) as Record<CharacterKey, CharacterData>

//dump data file to respective character directory.
Object.entries(characterSkillParamDump).forEach(([characterKey, data]) => {
  if (characterKey.includes('_')) {//Traveler, for multi element support
    const [charKey, eleKey] = characterKey.split("_")
    dumpFile(`../src/Data/Characters/${charKey}/${eleKey}/skillParam_gen.json`, data)
  } else
    dumpFile(`../src/Data/Characters/${characterKey}/skillParam_gen.json`, data)
})

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
  const { WeaponType, RankLevel, WeaponProp, SkillAffix, WeaponPromoteId } = weaponData
  const [main, sub] = WeaponProp
  const [refinementDataId,] = SkillAffix
  const refData = refinementDataId && equipAffixExcelConfigData[refinementDataId]

  const ascData = weaponPromoteExcelConfigData[WeaponPromoteId]

  const result: WeaponData = {
    weaponType: weaponMap[WeaponType],
    rarity: RankLevel,
    mainStat: {
      type: propTypeMap[main.PropType],
      base: extrapolateFloat(main.InitValue),
      curve: main.Type
    },
    subStat: sub.PropType ? {
      type: propTypeMap[sub.PropType],
      base: extrapolateFloat(sub.InitValue),
      curve: sub.Type
    } : undefined,
    addProps: refData ? refData.map(asc =>
      Object.fromEntries(asc.AddProps.filter(ap => ap.Value).map(ap =>
        [propTypeMap[ap.PropType], extrapolateFloat(ap.Value)]))
    ) : undefined,
    ascension: ascData.map(asd => {
      if (!asd) return { addStats: {} }
      return {
        addStats: Object.fromEntries(asd.AddProps.filter(a => a.Value && a.PropType).map(a => [
          propTypeMap[a.PropType], extrapolateFloat(a.Value)
        ]))
      }
    }) as any
  }
  return [weaponIdMap[weaponid], result]
})) as Record<WeaponKey, WeaponData>

//dump data file to respective weapon directory.
Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
  dumpFile(`../src/Data/Weapons/${data.weaponType[0].toUpperCase() + data.weaponType.slice(1)}/${weaponKey}/data_gen.json`, data))

//exp curve to generate  stats at every level
dumpFile(`../src/Weapon/expCurve_gen.json`, weaponCurveExcelConfigData)
dumpFile(`../src/Character/expCurve_gen.json`, characterExpCurve)

//dump artifact data
dumpFile('../src/Artifact/artifact_sub_gen.json', artifactSubstatData)
dumpFile('../src/Artifact/artifact_main_gen.json', artifactMainstatData)
dumpFile('../src/Artifact/artifact_sub_rolls_gen.json', artifactSubstatRollData)
dumpFile('../src/Artifact/artifact_sub_rolls_correction_gen.json', artifactSubstatRollCorrection)

//generate the MapHashes for localization for artifacts
Object.entries(reliquarySetExcelConfigData).filter(([SetId, data]) => SetId in artifactIdMap).forEach(([SetId, data]) => {
  const { EquipAffixId, SetNeedNum, ContainsList } = data
  if (!EquipAffixId) return

  const setEffects = Object.fromEntries(SetNeedNum.map((setNeed, i) => {
    const equipAffixData = equipAffixExcelConfigData[EquipAffixId]?.[i]
    if (!equipAffixData) throw `No data for EquipAffixId ${EquipAffixId} for setEffect ${setNeed}`
    return [setNeed, equipAffixData.DescTextMapHash]
  }))

  const pieces = Object.fromEntries(ContainsList.map(pieceId => {
    const pieceData = artifactPiecesData[pieceId]
    if (!pieceData) throw `No piece data with Id ${pieceId} in SetId ${SetId}`
    const { EquipType, NameTextMapHash, DescTextMapHash } = pieceData
    return [artifactSlotMap[EquipType], {
      name: NameTextMapHash,
      desc: DescTextMapHash
    }]
  }))

  const setName = equipAffixExcelConfigData[EquipAffixId]?.[0]?.NameTextMapHash

  mapHashData.artifact[artifactIdMap[SetId]] = {
    setName,
    setEffects,
    pieces
  }
})

//generate the MapHashes for localization for weapons
Object.entries(weaponExcelConfigData).filter(([weaponid,]) => weaponid in weaponIdMap).forEach(([weaponid, weaponData]) => {
  const { NameTextMapHash, DescTextMapHash, SkillAffix } = weaponData
  const [ascensionDataId,] = SkillAffix
  const ascData = ascensionDataId && equipAffixExcelConfigData[ascensionDataId]

  mapHashData.weapon[weaponIdMap[weaponid]] = {
    name: NameTextMapHash,
    description: DescTextMapHash,
    passiveName: ascData ? ascData[0].NameTextMapHash : 0,
    passiveDescription: ascData ? ascData.map(asc => asc.DescTextMapHash) : [0, 0, 0, 0, 0],
  }
})

//generate the MapHashes for localization for characters
Object.entries(avatarExcelConfigData).filter(([charid,]) => charid in characterIdMap).forEach(([charid, charData]) => {
  const { NameTextMapHash, DescTextMapHash, SkillDepotId, CandSkillDepotIds } = charData
  const { AvatarTitleTextMapHash, AvatarConstellationBeforTextMapHash } = characterInfo[charid]
  let skillDepotId = SkillDepotId


  const keys = ["char", characterIdMap[charid]]
  layeredAssignment(mapHashData, [...keys, "name"], NameTextMapHash)
  layeredAssignment(mapHashData, [...keys, "title"], AvatarTitleTextMapHash)
  layeredAssignment(mapHashData, [...keys, "description"], DescTextMapHash)
  // layeredAssignment(mapHashData, [...keys, "descriptionDetail"], AvatarDetailTextMapHash)
  layeredAssignment(mapHashData, [...keys, "constellationName"], AvatarConstellationBeforTextMapHash)
  function genTalentHash(keys: string[], depot: AvatarSkillDepotExcelConfigData) {
    const { EnergySkill: burst, Skills: [normal, skill, sprint], Talents, InherentProudSkillOpens: [passive1, passive2, passive3, , passive] } = depot
    layeredAssignment(mapHashData, [...keys, "auto", "name"], [talents[normal].NameTextMapHash, "autoName"])
    layeredAssignment(mapHashData, [...keys, "auto", "fields"], [talents[normal].DescTextMapHash, "autoFields"])
    layeredAssignment(mapHashData, [...keys, "auto", "skillParams"], skillGroups[talents[normal].ProudSkillGroupId][0].ParamDescList.map(id => [id, "skillParam"]))

    layeredAssignment(mapHashData, [...keys, "skill", "name"], talents[skill].NameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "skill", "description"], [talents[skill].DescTextMapHash, "paragraph"])
    layeredAssignment(mapHashData, [...keys, "skill", "skillParams"], skillGroups[talents[skill].ProudSkillGroupId][0].ParamDescList.map(id => [id, "skillParam"]))

    layeredAssignment(mapHashData, [...keys, "burst", "name"], talents[burst].NameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "burst", "description"], [talents[burst].DescTextMapHash, "paragraph"])
    layeredAssignment(mapHashData, [...keys, "burst", "skillParams"], skillGroups[talents[burst].ProudSkillGroupId][0].ParamDescList.map(id => [id, "skillParam"]))

    if (sprint) {
      layeredAssignment(mapHashData, [...keys, "sprint", "name"], talents[sprint].NameTextMapHash)
      layeredAssignment(mapHashData, [...keys, "sprint", "description"], [talents[sprint].DescTextMapHash, "paragraph"])
    }

    layeredAssignment(mapHashData, [...keys, "passive1", "name"], skillGroups[passive1.ProudSkillGroupId][0].NameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "passive1", "description"], [skillGroups[passive1.ProudSkillGroupId][0].DescTextMapHash, "paragraph"])

    layeredAssignment(mapHashData, [...keys, "passive2", "name"], skillGroups[passive2.ProudSkillGroupId][0].NameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "passive2", "description"], [skillGroups[passive2.ProudSkillGroupId][0].DescTextMapHash, "paragraph"])

    if (passive3?.ProudSkillGroupId) {
      layeredAssignment(mapHashData, [...keys, "passive3", "name"], skillGroups[passive3.ProudSkillGroupId][0].NameTextMapHash)
      layeredAssignment(mapHashData, [...keys, "passive3", "description"], [skillGroups[passive3.ProudSkillGroupId][0].DescTextMapHash, "paragraph"])
    }
    //seems to be only used by SangonomiyaKokomi
    if (passive?.ProudSkillGroupId) {
      layeredAssignment(mapHashData, [...keys, "passive", "name"], skillGroups[passive.ProudSkillGroupId][0].NameTextMapHash)
      layeredAssignment(mapHashData, [...keys, "passive", "description"], [skillGroups[passive.ProudSkillGroupId][0].DescTextMapHash, "paragraph"])
    }

    Talents.forEach((skId, i) => {
      layeredAssignment(mapHashData, [...keys, `constellation${i + 1}`, "name"], constellations[skId].NameTextMapHash)
      layeredAssignment(mapHashData, [...keys, `constellation${i + 1}`, "description"], [constellations[skId].DescTextMapHash, "paragraph"])
    })
  }

  if (CandSkillDepotIds.length) { //Traveler
    //this will be 504,506... for male
    genTalentHash([...keys, "anemo"], skillDepot[704])
    genTalentHash([...keys, "geo"], skillDepot[706])
    genTalentHash([...keys, "electro"], skillDepot[707])
  } else {
    genTalentHash(keys, skillDepot[skillDepotId])
  }
})

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
  const fileDir = `../public/locales/${lang}`
  if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)

  Object.entries(data).forEach(([type, typeData]) => {
    //general manual localiation namespaces
    if (["sheet", "weaponKey", "resonance"].includes(type))
      return dumpFile(`${fileDir}/${type}_gen.json`, typeData)

    //weapons/characters/artifacts
    Object.entries((typeData as any)).forEach(([itemKey, data]) =>
      dumpFile(`${fileDir}/${type}_${itemKey}_gen.json`, data))
  })
})
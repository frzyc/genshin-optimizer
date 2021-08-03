import { artifactIdMap, artifactSlotMap, characterIdMap, CharacterKey, DWeaponTypeKey, Language, propTypeMap, QualityTypeMap, StatKey, weaponIdMap, WeaponKey, weaponMap, WeaponTypeKey } from '.'
import mapHashData from './Data'
import artifactMainstatData from './DataminedModules/artifact/artifactMainstat'
import artifactPiecesData from './DataminedModules/artifact/artifactPiecesData'
import artifactSetData from './DataminedModules/artifact/artifactSets'
import artifactSubstatData from './DataminedModules/artifact/artifactSubstat'
import artifactSubstatRollData from './DataminedModules/artifact/artifactSubstatRolls'
import ascensionData from './DataminedModules/character/ascension'
import characterData from './DataminedModules/character/character'
import characterExpCurve, { CharacterGrowCurveKey } from './DataminedModules/character/characterExpCurve'
import characterInfo from './DataminedModules/character/characterInfo'
import constellations from './DataminedModules/character/constellations'
import passives from './DataminedModules/character/passives'
import skillDepot, { AvatarSkillDepotExcelConfigData } from './DataminedModules/character/skillDepot'
import talents from './DataminedModules/character/talents'
import equipAffixDataData from './DataminedModules/common/equipAffix'
import weaponData from './DataminedModules/weapon/weapon'
import weaponAscensionData from './DataminedModules/weapon/weaponAscension'
import weaponExpCurve, { WeaponGrowCurveKey } from './DataminedModules/weapon/weaponExpCurve'
import { extrapolateFloat } from './extrapolateFloat'
import { parsingFunctions, preprocess } from './parseUtil'
import { crawlObject, dumpFile, layeredAssignment } from './Util'
const fs = require('fs')

const languageMap = {
  chs: require('./GenshinData/TextMap/TextMapCHS.json'),
  cht: require('./GenshinData/TextMap/TextMapCHT.json'),
  de: require('./GenshinData/TextMap/TextMapDE.json'),
  en: require('./GenshinData/TextMap/TextMapEN.json'),
  es: require('./GenshinData/TextMap/TextMapES.json'),
  fr: require('./GenshinData/TextMap/TextMapFR.json'),
  id: require('./GenshinData/TextMap/TextMapID.json'),
  ja: require('./GenshinData/TextMap/TextMapJP.json'),
  ko: require('./GenshinData/TextMap/TextMapKR.json'),
  pt: require('./GenshinData/TextMap/TextMapPT.json'),
  ru: require('./GenshinData/TextMap/TextMapRU.json'),
  th: require('./GenshinData/TextMap/TextMapTH.json'),
  vi: require('./GenshinData/TextMap/TextMapVI.json')
} as const

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
  ascensions: Array<{
    props: {
      [key: string]: number
    }
  }>,
  birthday: {
    month: number,
    day: number
  }
}
//parse baseStat/ascension/basic data
const characterDataDump = Object.fromEntries(Object.entries(characterData).filter(([charid, charData]) => charid in characterIdMap).map(([charid, charData]) => {
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
  if (characterKey.includes('_')) {//traveler, for multi element support
    const [charKey, eleKey] = characterKey.split("_")
    dumpFile(`../src/Data/Characters/${charKey}/data_${eleKey}_gen.json`, data)
  } else
    dumpFile(`../src/Data/Characters/${characterKey}/data_gen.json`, data)
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
  addProps: Array<Partial<Record<StatKey, number>>>
  ascension: Array<{
    addStats: Partial<Record<StatKey, number>>
  }>
}
const weaponDataDump = Object.fromEntries(Object.entries(weaponData).filter(([weaponid, weaponData]) => weaponid in weaponIdMap).map(([weaponid, weaponData]) => {
  const { WeaponType, RankLevel, WeaponProp, SkillAffix, WeaponPromoteId } = weaponData
  const [main, sub] = WeaponProp
  const [refinementDataId,] = SkillAffix
  const refData = refinementDataId && equipAffixDataData[refinementDataId]

  const ascData = weaponAscensionData[WeaponPromoteId]

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
dumpFile(`../src/Weapon/expCurve_gen.json`, weaponExpCurve)
dumpFile(`../src/Character/expCurve_gen.json`, characterExpCurve)

//dump artifact data
dumpFile('../src/Artifact/artifact_sub_gen.json', artifactSubstatData)
dumpFile('../src/Artifact/artifact_main_gen.json', artifactMainstatData)
dumpFile('../src/Artifact/artifact_sub_rolls_gen.json', artifactSubstatRollData)

//generate the MapHashes for localization for artifacts
Object.entries(artifactSetData).forEach(([SetId, data]) => {
  if (SetId === "15004" || SetId === "15012") return // "Glacier and Snowfield"  "Prayers to the Firmament"
  const { EquipAffixId, SetNeedNum, ContainsList } = data
  if (!EquipAffixId) return

  const setEffects = Object.fromEntries(SetNeedNum.map((setNeed, i) => {
    const equipAffixData = equipAffixDataData[EquipAffixId]?.[i]
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

  const setName = equipAffixDataData[EquipAffixId]?.[0]?.NameTextMapHash

  mapHashData.artifact[artifactIdMap[SetId]] = {
    setName,
    setEffects,
    pieces
  }
})

//generate the MapHashes for localization for weapons
Object.entries(weaponData).filter(([weaponid,]) => weaponid in weaponIdMap).forEach(([weaponid, weaponData]) => {
  const { NameTextMapHash, DescTextMapHash, SkillAffix } = weaponData
  const [ascensionDataId,] = SkillAffix
  const ascData = ascensionDataId && equipAffixDataData[ascensionDataId]

  mapHashData.weapon[weaponIdMap[weaponid]] = {
    name: NameTextMapHash,
    description: DescTextMapHash,
    passiveName: ascData ? ascData[0].NameTextMapHash : 0,
    passiveDescription: ascData ? ascData.map(asc => asc.DescTextMapHash) : [0, 0, 0, 0, 0],
  }
})

//generate the MapHashes for localization for characters
Object.entries(characterData).filter(([charid,]) => charid in characterIdMap).forEach(([charid, charData]) => {
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
    const { EnergySkill: burst, Skills: [normal, skill, sprint], Talents, InherentProudSkillOpens: [passive1, passive2, passive3] } = depot
    layeredAssignment(mapHashData, [...keys, "auto", "name"], [talents[normal].NameTextMapHash, "autoName"])
    layeredAssignment(mapHashData, [...keys, "auto", "fields"], [talents[normal].DescTextMapHash, "autoFields"])

    layeredAssignment(mapHashData, [...keys, "skill", "name"], talents[skill].NameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "skill", "description"], [talents[skill].DescTextMapHash, "paragraph"])

    layeredAssignment(mapHashData, [...keys, "burst", "name"], talents[burst].NameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "burst", "description"], [talents[burst].DescTextMapHash, "paragraph"])

    if (sprint) {
      layeredAssignment(mapHashData, [...keys, "sprint", "name"], talents[sprint].NameTextMapHash)
      layeredAssignment(mapHashData, [...keys, "sprint", "description"], [talents[sprint].DescTextMapHash, "paragraph"])
    }

    layeredAssignment(mapHashData, [...keys, "passive1", "name"], passives[passive1.ProudSkillGroupId].NameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "passive1", "description"], [passives[passive1.ProudSkillGroupId].DescTextMapHash, "paragraph"])

    layeredAssignment(mapHashData, [...keys, "passive2", "name"], passives[passive2.ProudSkillGroupId].NameTextMapHash)
    layeredAssignment(mapHashData, [...keys, "passive2", "description"], [passives[passive2.ProudSkillGroupId].DescTextMapHash, "paragraph"])

    if (passive3?.ProudSkillGroupId) {
      layeredAssignment(mapHashData, [...keys, "passive3", "name"], passives[passive3.ProudSkillGroupId].NameTextMapHash)
      layeredAssignment(mapHashData, [...keys, "passive3", "description"], [passives[passive3.ProudSkillGroupId].DescTextMapHash, "paragraph"])
    }

    Talents.forEach((skId, i) => {
      layeredAssignment(mapHashData, [...keys, `constellation${i + 1}`, "name"], constellations[skId].NameTextMapHash)
      layeredAssignment(mapHashData, [...keys, `constellation${i + 1}`, "description"], [constellations[skId].DescTextMapHash, "paragraph"])
    })
  }

  if (CandSkillDepotIds.length) { //traveler
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
    if (type === "sheet" || type === "weaponKey")
      return dumpFile(`${fileDir}/${type}_gen.json`, typeData)

    //weapons/characters/artifacts
    Object.entries((typeData as any)).forEach(([itemKey, data]) =>
      dumpFile(`${fileDir}/${type}_${itemKey}_gen.json`, data))
  })
})
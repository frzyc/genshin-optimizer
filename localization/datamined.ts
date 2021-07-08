import { characterIdMap, Language, propTypeMap, QualityTypeMap, weaponMap } from './const'
import data from './Data'
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
}

//Main localization dumping
const languageData = {}
Object.entries(languageMap).forEach(([lang, langStrings]) => {
  crawlObject(data, [], v => typeof v === "number" || (Array.isArray(v) && typeof v[1] === "string"), (value, keys) => {
    // const [type, characterKey, skill, field] = keys

    if (typeof value === "number") value = [value, "string"]
    const [stringID, processing] = value
    const string = parsingFunctions[processing](lang as Language, preprocess(langStrings[stringID]))
    if (!string) throw (`Invalid string in ${keys}, for lang:${lang} (${stringID}:${processing})`)
    layeredAssignment(languageData, [lang, ...keys], string)
  })
})

//dump the language data to files
Object.entries(languageData).forEach(([lang, data]) => {
  const fileDir = `../public/locales/${lang}`
  if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)

  Object.entries(data).forEach(([type, typeData]) => {
    if (type === "sheet")
      return dumpFile(`${fileDir}/${type}_gen.json`, typeData)
    Object.entries((typeData as any)).forEach(([charKey, charData]) =>
      dumpFile(`${fileDir}/${type}_${charKey}_gen.json`, charData))
  })
})

/** parsing character data/MapHash. Will superseed a lot of the above code for manual localization parsing. */
const characterIds = Object.keys(characterIdMap).map(id => parseInt(id))

//ascenion parsing
const ascensionSrc = require('./GenshinData/ExcelBinOutput/AvatarPromoteExcelConfigData.json')
const ascensionData = {}
ascensionSrc.forEach(asc => {
  const { AvatarPromoteId, PromoteLevel = 0, AddProps } = asc
  if (!ascensionData[AvatarPromoteId]) ascensionData[AvatarPromoteId] = []
  const props = Object.fromEntries(AddProps.map(({ PropType, Value = 0 }) =>
    [propTypeMap[PropType], Value]))
  ascensionData[AvatarPromoteId][PromoteLevel] = {
    props
  }
})

//exp curve
const expCurveSrc = require('./GenshinData/ExcelBinOutput/AvatarCurveExcelConfigData.json')
const parsedCurve = {}
expCurveSrc.forEach(({ Level, CurveInfos }) =>
  CurveInfos.forEach(({ Type, Value }) => {
    if (!parsedCurve[Type]) parsedCurve[Type] = {}
    parsedCurve[Type][Level] = Value
  }))
dumpFile(`../src/Character/expCurve_gen.json`, parsedCurve)


//skill depot TODO: use this to extract talent strings for localization
const skillDepotSrc = require('./GenshinData/ExcelBinOutput/AvatarSkillDepotExcelConfigData.json')
const skillDepot = Object.fromEntries(skillDepotSrc.map(skill => {
  const { Id } = skill
  return [Id, skill]
}))

const characterDataSrc = require('./GenshinData/ExcelBinOutput/AvatarExcelConfigData.json')
//character data
const characterDataMapped = Object.fromEntries(characterDataSrc.filter(charData => characterIds.includes(charData.Id)).map(charData =>
  [characterIdMap[charData.Id], charData]))

//parse baseStat/ascension/basic data
const characterData = Object.fromEntries(Object.entries(characterDataMapped).map(([characterKey, charData]) => {
  const { WeaponType, QualityType, AvatarPromoteId, HpBase, AttackBase, DefenseBase, PropGrowCurves } = charData
  const curves = Object.fromEntries(PropGrowCurves.map(({ Type, GrowCurve }) => [propTypeMap[Type], GrowCurve]))
  const result = {
    weaponTypeKey: weaponMap[WeaponType],
    base: { hp: HpBase, atk: AttackBase, def: DefenseBase },
    curves,

    star: QualityTypeMap[QualityType],
    ascensions: ascensionData[AvatarPromoteId]
  }

  return [characterKey, result]
}))

//dump data file to respective character directory.
Object.entries(characterData).forEach(([characterKey, data]) => {
  if (characterKey.includes('_')) {//traveler, for multi element support
    const [charKey, eleKey] = characterKey.split("_")
    dumpFile(`../src/Data/Characters/${charKey}/data_${eleKey}_gen.json`, data)
  } else
    dumpFile(`../src/Data/Characters/${characterKey}/data_gen.json`, data)
})

//parse MapHash
const characterMapHash = Object.fromEntries(Object.entries(characterDataMapped).map(([characterKey, charData]) => {
  //TODO SkillDepotId
  const { NameTextMapHash, DescTextMapHash } = charData
  const result = {
    MapHash: {
      name: NameTextMapHash,
      DescText: DescTextMapHash
    },
  }

  return [characterKey, result]
}))

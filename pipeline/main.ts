import { characterIdMap, Language, propTypeMap, QualityTypeMap, weaponMap, WeaponTypeKey } from './const'
import data from './Data'
import artifactMainstatData from './DataminedModules/artifactMainstat'
import artifactSubstatData from './DataminedModules/artifactSubstat'
import ascensionData from './DataminedModules/ascension'
import characterData from './DataminedModules/character'
import expCurve, { GrowCurveKey } from './DataminedModules/expCurve'
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

/* ####################################################
 * # Importing data from datamined files.
 */

//exp curve to generate character stats at every level
dumpFile(`../src/Character/expCurve_gen.json`, expCurve)
export type CharacterData = {
  weaponTypeKey: WeaponTypeKey
  base: {
    hp: number,
    atk: number,
    def: number,
  },
  curves: {
    hp: GrowCurveKey,
    atk: GrowCurveKey,
    def: GrowCurveKey,
  },
  star: number,
  ascensions: Array<{
    props: {
      [key: string]: number
    }
  }>
}
//parse baseStat/ascension/basic data
const characterDataDump = Object.fromEntries(Object.entries(characterData).filter(([charid, charData]) => charid in characterIdMap).map(([charid, charData]) => {
  const { WeaponType, QualityType, AvatarPromoteId, HpBase, AttackBase, DefenseBase, PropGrowCurves } = charData
  const curves = Object.fromEntries(PropGrowCurves.map(({ Type, GrowCurve }) => [propTypeMap[Type], GrowCurve])) as any //TODO: typing
  const result: CharacterData = {
    weaponTypeKey: weaponMap[WeaponType],
    base: { hp: HpBase, atk: AttackBase, def: DefenseBase },
    curves,

    star: QualityTypeMap[QualityType],
    ascensions: ascensionData[AvatarPromoteId]
  }

  return [characterIdMap[charid], result]
})) as {
  [characterkey: string]: CharacterData
}

//dump data file to respective character directory.
Object.entries(characterDataDump).forEach(([characterKey, data]) => {
  if (characterKey.includes('_')) {//traveler, for multi element support
    const [charKey, eleKey] = characterKey.split("_")
    dumpFile(`../src/Data/Characters/${charKey}/data_${eleKey}_gen.json`, data)
  } else
    dumpFile(`../src/Data/Characters/${characterKey}/data_gen.json`, data)
})

//parse MapHash
const characterMapHash = Object.fromEntries(Object.entries(characterData).filter(([charid, charData]) => charid in characterIdMap).map(([charid, charData]) => {
  //TODO SkillDepotId
  const { NameTextMapHash, DescTextMapHash } = charData
  const result = {
    MapHash: {
      name: NameTextMapHash,
      DescText: DescTextMapHash
    },
  }

  return [characterIdMap[charid], result]
}))

//dump artifact data
dumpFile('./artifactsub.json', artifactSubstatData)//TODO: how is this structured?
dumpFile('../src/Artifact/artifact_main_gen.json', artifactMainstatData)
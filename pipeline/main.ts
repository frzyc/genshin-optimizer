
import { characterIdMap, Language, propTypeMap, QualityTypeMap, weaponMap, DWeaponTypeKey, WeaponKey, CharacterKey, weaponIdMap, PropTypeKey, StatKey, WeaponTypeKey } from '.'
import data from './Data'
import artifactMainstatData from './DataminedModules/artifactMainstat'
import artifactSubstatData from './DataminedModules/artifactSubstat'
import ascensionData from './DataminedModules/ascension'
import characterData from './DataminedModules/character'
import characterExpCurve, { CharacterGrowCurveKey } from './DataminedModules/characterExpCurve'
import weaponData from './DataminedModules/weapon'
import weaponExpCurve, { WeaponGrowCurveKey } from './DataminedModules/weaponExpCurve'
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
})) as Record<CharacterKey, CharacterData>

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

type WeaponProp = {
  type: StatKey,
  base: number,
  curve: WeaponGrowCurveKey
}
export type WeaponData = {
  weaponType: WeaponTypeKey
  rarity: number
  mainStat: WeaponProp
  subStat: WeaponProp
}
const weaponDataDump = Object.fromEntries(Object.entries(weaponData).filter(([weaponid, weaponData]) => weaponid in weaponIdMap).map(([weaponid, weaponData]) => {
  const { WeaponType, RankLevel, WeaponProp } = weaponData
  const [main, sub] = WeaponProp
  const result: WeaponData = {
    weaponType: weaponMap[WeaponType],
    rarity: RankLevel,
    mainStat: {
      type: propTypeMap[main.PropType],
      base: extrapolateFloat(main.InitValue),
      curve: main.Type
    },
    subStat: {
      type: propTypeMap[sub.PropType],
      base: extrapolateFloat(sub.InitValue),
      curve: sub.Type
    }
  }
  return [weaponIdMap[weaponid], result]
})) as Record<WeaponKey, WeaponData>

//dump data file to respective character directory.
Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
  dumpFile(`../src/Data/Weapons/${data.weaponType[0].toUpperCase() + data.weaponType.slice(1)}/${weaponKey}_gen.json`, data))

//exp curve to generate  stats at every level
dumpFile(`../src/Weapon/expCurve_gen.json`, weaponExpCurve)
dumpFile(`../src/Character/expCurve_gen.json`, characterExpCurve)

//dump artifact data
dumpFile('../src/Artifact/artifact_sub_gen.json', artifactSubstatData)
dumpFile('../src/Artifact/artifact_main_gen.json', artifactMainstatData)
import data from './Data'
const fs = require('fs')
function crawlObject(obj, keys, validate, cb) {
  if (validate(obj)) cb(obj, keys)
  else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => crawlObject(val, [...keys, key], validate, cb))
}
function layeredAssignment(obj, keys, value) {
  keys.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) return (accu[key] = value)
    if (!accu[key]) accu[key] = {}
    return accu[key]
  }, obj)
  return obj
}
function objProxy(obj, name) {
  return new Proxy(obj, {
    get: function (target, prop, receiver) {
      if (!obj.hasOwnProperty(prop))
        throw new Error(`${name}[${String(prop)}] does not exist`)
      return Reflect.get(target, prop, receiver);
    }
  })
}
function parseBulletPoints(strings: string[]): string[] {
  strings.push("")
  const { strs } = strings.reduce(({ strs, arr }, str) => {
    const isBullet = str.startsWith("·")
    if (isBullet) str = str.slice(1)
    if (arr) {
      if (isBullet) arr.push(str)
      else {
        strs.push(arr as any) // TODO
        arr = undefined
      }
    } else if (isBullet) { //start of new bullet point list
      arr = [str]
    }
    if (!isBullet) strs.push(str)
    return { strs, arr }
  }, { strs: [] as string[], arr: undefined as string[] | undefined })
  strs.pop()
  return strs
}
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

const tagColor = objProxy({
  "FFD780FF": "strong",
  "80FFD7FF": "anemo",
  "FFE699FF": "geo",
  "99FFFFFF": "cryo",
  "80C0FFFF": "hydro",
  "FF9999FF": "pyro",
  "FFACFFFF": "electro"
} as const, "tagColor")

function preprocess(string: string): string {
  { // color tags
    const stack: ColorTag[] = []
    string = string.replace(/<(\/?)color(?:=#([0-9A-F]{8}))?>/g, (_match, isClosed, color) => {
      if (isClosed) return `</${stack.pop()}>`
      const tag = tagColor[color]!
      stack.push(tag)
      return `<${tag}>`
    })
  }

  if (string.startsWith("#")) { // `{}` tags
    string = string.substring(1)
      .replace(/\{LAYOUT_(PC|PS|MOBILE)#(.*?)\}/g,
        (_match, layout, text) => layout === "PC" ? text : "") // Use PC layout
  }
  return string
}
function plungeUtil(lang, string, low) {
  const res = low ? "$2" : "$3"
  string = string.split('|')[0]
  switch (lang) {
    case "chs":
    case "cht":
    case "ja":
      string = string.replace(/((\S{2})\/(\S{2}))/, res)
      break;
    case "th":
      string = string.replace(/((\S{3})\/(\S{3}))/, res)
    default:
      string = string.replace(/((\S+)\/(\S+))/, res)
      break;
  }
  return string
}

const parsingFunctions: { [key: string]: (lang: Language, string: string) => string } = {
  autoName: (lang, string) => {
    //starts with Normal Attack: ______ in english
    if (string.includes("·")) {
      const index = string.indexOf("·")
      string = string.slice(index + 1)
    } else if (string.includes(":")) {
      string = string.split(":")[1].trim()
    } else if (string.includes(" - ")) {
      const index = string.indexOf(" - ")
      string = string.slice(index + 3)
    }
    if (!string) throw (`${lang} has invalid "name"`)
    return string
  },
  autoFields: (lang, string) => {
    const [normal, charged, plunging] = string.split("\\n\\n").map(s => s.trim().replace(/\\n/g, " "))
    string = { normal, charged, plunging } as any
    return string
  },
  paragraph: (lang, string) => {
    let parsed = string.split("\\n").map(s => s || "<br/>")
    string = { ...parseBulletPoints(parsed) } as any
    return string
  },
  skillParam: (lang, string) => {
    string = string.split('|')[0]
    return string
  },
  plungeLow: (lang, string) => plungeUtil(lang, string, true),
  plungeHigh: (lang, string) => plungeUtil(lang, string, false),
  string: (lang, string) => string
}

function dumpFile(filename, obj, print = true) {
  const fileStr = JSON.stringify(obj, null, 2)
  fs.writeFile(filename, fileStr, () => print && console.log("Generated JSON at", filename))
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

const characterIdMap = objProxy({
  //10000000: Kate
  //10000001: Ayaka
  10000003: "jean",
  10000005: "traveler_geo",
  10000006: "lisa",
  10000007: "traveler_anemo",
  10000014: "barbara",
  10000015: "kaeya",
  10000016: "diluc",
  10000020: "razor",
  10000021: "amber",
  10000022: "venti",
  10000023: "xiangling",
  10000024: "beidou",
  10000025: "xingqiu",
  10000026: "xiao",
  10000027: "ningguang",
  10000029: "klee",
  10000030: "zhongli",
  10000031: "fischl",
  10000032: "bennett",
  10000033: "tartaglia",
  10000034: "noelle",
  10000035: "qiqi",
  10000036: "chongyun",
  10000037: "ganyu",
  10000038: "albedo",
  10000039: "diona",
  10000041: "mona",
  10000042: "keqing",
  10000043: "sucrose",
  10000044: "xinyan",
  10000045: "rosaria",
  10000046: "hutao",
  10000047: "kaedeharakazuha",
  10000048: "yanfei",
  // 10000049: "TEMPLATE",
  // 10000050: "TEMPLATE",
  10000051: "eula",
  // 10000053: "TEMPLATE",
  // 11000008: "TEMPLATE",
  // 11000009: "TEMPLATE",
  // 11000010: "TEMPLATE",
  // 11000011: "TEMPLATE",



  // "albedo", "amber", "barbara", "beidou", "bennett", "chongyun", "diluc", "diona", "fischl", "ganyu",
  // "hutao", "jean", "kaeya", "keqing", "klee", "lisa", "mona", "ningguang", "noelle", "qiqi",
  // "razor", "sucrose", "tartaglia", "traveler", "traveler", "venti", "xiao", "xiangling", "xingqiu", "xinyan",
  // "zhongli", "rosaria", "yanfei", "eula", "kaedeharakazuha"
}, "characterIdMap")

const weaponMap = objProxy({
  WEAPON_SWORD_ONE_HAND: "sword",
  WEAPON_CATALYST: "catalyst",
  WEAPON_CLAYMORE: "claymore",
  WEAPON_BOW: "bow",
  WEAPON_POLE: "polearm"
}, "weaponMap")
const propTypeMap = objProxy({
  FIGHT_PROP_BASE_HP: "hp",
  FIGHT_PROP_BASE_ATTACK: "atk",
  FIGHT_PROP_BASE_DEFENSE: "def",
  FIGHT_PROP_HEAL_ADD: "heal_",
  FIGHT_PROP_CRITICAL_HURT: "critDMG_",
  FIGHT_PROP_ELEMENT_MASTERY: "eleMas",
  FIGHT_PROP_ATTACK_PERCENT: "atk_",
  FIGHT_PROP_HP_PERCENT: "hp_",
  FIGHT_PROP_CHARGE_EFFICIENCY: "enerRech_",
  FIGHT_PROP_CRITICAL: "critRate_",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "physical_dmg_",
  FIGHT_PROP_ELEC_ADD_HURT: "electro_dmg_",
  FIGHT_PROP_ROCK_ADD_HURT: "geo_dmg_",
  FIGHT_PROP_FIRE_ADD_HURT: "pyro_dmg_",
  FIGHT_PROP_WATER_ADD_HURT: "hydro_dmg_",
  FIGHT_PROP_DEFENSE_PERCENT: "def_",
  FIGHT_PROP_ICE_ADD_HURT: "cryo_dmg_",
  FIGHT_PROP_WIND_ADD_HURT: "anemo_dmg_",
}, "propTypeMap")
const QualityTypeMap = objProxy({
  QUALITY_ORANGE: 5,
  QUALITY_PURPLE: 4,
  QUALITY_BLUE: 3,
  QUALITY_GREEN: 2,
}, "QualityTypeMap")

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
// dumpFile(`./ascensionData.json`, ascensionData)


//exp curve
const expCurveSrc = require('./GenshinData/ExcelBinOutput/AvatarCurveExcelConfigData.json')
const parsedCurve = {}
expCurveSrc.forEach(({ Level, CurveInfos }) =>
  CurveInfos.forEach(({ Type, Value }) => {
    if (!parsedCurve[Type]) parsedCurve[Type] = {}
    parsedCurve[Type][Level] = Value
  }))
dumpFile(`../src/Character/expCurve_gen.json`, parsedCurve)


//skill depot TODO use this to extract talent strings for localization
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
//dump file to respective character directory.
Object.entries(characterData).forEach(([characterKey, data]) => {
  if (characterKey.includes('_')) {//traveler, for multi element support
    const [charKey, eleKey] = characterKey.split("_")
    dumpFile(`../src/Data/Characters/${charKey}/data_${eleKey}_gen.json`, data)
  } else
    dumpFile(`../src/Data/Characters/${characterKey}/data_gen.json`, data)
})
// dumpFile(`./characterData.json`, characterData)

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
// dumpFile(`./characterMapHash.json`, characterMapHash)

type Language = keyof typeof languageMap
type ColorTag = typeof tagColor[keyof typeof tagColor]


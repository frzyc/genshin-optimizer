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
  chs: require('./TextMap/TextMapCHS.json'),
  cht: require('./TextMap/TextMapCHT.json'),
  de: require('./TextMap/TextMapDE.json'),
  en: require('./TextMap/TextMapEN.json'),
  es: require('./TextMap/TextMapES.json'),
  fr: require('./TextMap/TextMapFR.json'),
  id: require('./TextMap/TextMapID.json'),
  ja: require('./TextMap/TextMapJP.json'),
  ko: require('./TextMap/TextMapKR.json'),
  pt: require('./TextMap/TextMapPT.json'),
  ru: require('./TextMap/TextMapRU.json'),
  th: require('./TextMap/TextMapTH.json'),
  vi: require('./TextMap/TextMapVI.json')
}

const tagColor = {
  "FFD780FF": "strong",
  "80FFD7FF": "anemo",
  "FFE699FF": "geo",
  "99FFFFFF": "cryo",
  "80C0FFFF": "hydro",
  "FF9999FF": "pyro",
  "FFACFFFF": "electro"
} as const
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
    if (type === "sheet") {
      const filename = `${fileDir}/${type}_gen.json`
      const fileStr = JSON.stringify(typeData, null, 2)
      fs.writeFile(filename, fileStr, () => console.log("Generated JSON at", filename))
      return
    }
    Object.entries((typeData as any)).forEach(([charKey, charData]) => {
      const filename = `${fileDir}/${type}_${charKey}_gen.json`
      const fileStr = JSON.stringify(charData, null, 2)
      fs.writeFile(filename, fileStr, () => console.log("Generated JSON at", filename))
    })
  })
})

type Language = keyof typeof languageMap
type ColorTag = typeof tagColor[keyof typeof tagColor]


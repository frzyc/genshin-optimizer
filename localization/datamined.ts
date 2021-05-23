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
  return strs
}
const languageMap = {
  chs: require('./TextMap/TextCHS.json'),
  cht: require('./TextMap/TextCHT.json'),
  de: require('./TextMap/TextDE.json'),
  en: require('./TextMap/TextEN.json'),
  es: require('./TextMap/TextES.json'),
  fr: require('./TextMap/TextFR.json'),
  id: require('./TextMap/TextID.json'),
  ja: require('./TextMap/TextJA.json'),
  ko: require('./TextMap/TextKO.json'),
  pt: require('./TextMap/TextPT.json'),
  ru: require('./TextMap/TextRU.json'),
  th: require('./TextMap/TextTH.json'),
  vi: require('./TextMap/TextVI.json')
}

const tagColor = {
  "FFD780FF": "strong",
  "FFE699FF": "geo",
  "99FFFFFF": "cryo",
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
    Object.entries((typeData as any)).forEach(([charKey, charData]) => {
      const filename = `${fileDir}/${type}_${charKey}_gen.json`
      const fileStr = JSON.stringify(charData, null, 2)
      fs.writeFile(filename, fileStr, () => console.log("Generated JSON at", filename))
    })
  })
})

type Language = keyof typeof languageMap
type ColorTag = typeof tagColor[keyof typeof tagColor]


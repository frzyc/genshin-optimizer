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
const tagData = {
  "<color=#FFD780FF>": ["<strong>", "</strong>"],
  "<color=#FFE699FF>": ["<geo>", "</geo>"]
}
const endTag = "</color>"
function colorTagConvertor(string: string) {
  Object.entries(tagData).forEach(([startTag, [replaceStrStartTag, replaceStrEndTag]]) => {
    while (string.includes(startTag))
      string = string.replace(startTag, replaceStrStartTag).replace(endTag, replaceStrEndTag)
  })
  return string
}
function parseBulletPoints(strings: string[]): string[] {
  const { strs } = strings.reduce(({ strs, arr }: { strs: any[], arr: string[] | undefined }, str) => {
    const isBullet = str.startsWith("·")
    if (isBullet) str = str.slice(1)
    if (arr) {
      if (isBullet) arr.push(str)
      else {
        strs.push(arr)
        arr = undefined
      }
    } else if (isBullet) {//start of new bullet point list
      arr = [str]
    }
    if (!isBullet) strs.push(str)
    return { strs, arr }
  }, { strs: [], arr: undefined })
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
const parsingFunctions: { [key: string]: (lang: string, string: string) => string } = {
  autoName: (lang, string) => {
    //starts with Normal Attack: ______ in english
    // console.log(lang, string);
    if (["chs", "cht", "ja", "ko"].includes(lang)) {
      const index = string.indexOf("·")
      string = string.slice(index + 1)
    } else if (["pt", "th"].includes(lang)) {
      const index = string.indexOf(" - ")
      string = string.slice(index + 3)
    } else if (["ru"].includes(lang)) {
      //Do nothing?
    } else {
      string = string.split(":")[1].trim()
    }
    // console.log(lang, string);
    if (!string) throw (`${lang} has invalid "name"`)
    return string
  },
  autoFields: (lang, string) => {
    // console.log(lang, string);
    const [normal, charged, plunging] = string.split("\\n\\n").map(s => s.trim().replace(/\\n/g, " ")).map(s => colorTagConvertor(s))
    string = { normal, charged, plunging } as any
    // console.log(lang, string);
    return string
  },
  paragraph: (lang, string) => {
    // console.log(lang, string);
    let parsed = string.split("\\n").map(s => {
      if (!s) return "<br/>"
      return colorTagConvertor(s)
    }) as any
    string = { ...parseBulletPoints(parsed) } as any
    // console.log(lang, string);
    return string
  },
  string: (lang, string) => string
}

const languageData = {}
Object.entries(languageMap).forEach(([lang, langStrings]) => {
  crawlObject(data, [], v => typeof v === "number" || Array.isArray(v), (value, keys) => {
    // const [type, characterKey, skill, field] = keys

    if (typeof value === "number") value = [value, "string"]
    const [stringID, processing] = value
    const string = parsingFunctions[processing](lang, langStrings[stringID])
    layeredAssignment(languageData, [lang, ...keys], string)
  })
})

//dump the language data to files
Object.entries(languageData).forEach(([lang, data]) => {
  const fileDir = `../public/locales/${lang}`
  if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)

  //TODO: do with weapon/artifacts
  Object.entries((data as any).char).forEach(([charKey, charData]) => {
    const filename = `${fileDir}/char_${charKey}.json`
    const fileStr = JSON.stringify(charData, null, 2)
    fs.writeFile(filename, fileStr, () => console.log("Generated JSON at", filename))
  })
})

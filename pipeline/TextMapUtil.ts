export const TextMapCHS = require('./GenshinData/TextMap/TextMapCHS.json')
export const TextMapCHT = require('./GenshinData/TextMap/TextMapCHT.json')
export const TextMapDE = require('./GenshinData/TextMap/TextMapDE.json')
export const TextMapEN = require('./GenshinData/TextMap/TextMapEN.json')
export const TextMapES = require('./GenshinData/TextMap/TextMapES.json')
export const TextMapFR = require('./GenshinData/TextMap/TextMapFR.json')
export const TextMapID = require('./GenshinData/TextMap/TextMapID.json')
export const TextMapJP = require('./GenshinData/TextMap/TextMapJP.json')
export const TextMapKR = require('./GenshinData/TextMap/TextMapKR.json')
export const TextMapPT = require('./GenshinData/TextMap/TextMapPT.json')
export const TextMapRU = require('./GenshinData/TextMap/TextMapRU.json')
export const TextMapTH = require('./GenshinData/TextMap/TextMapTH.json')
export const TextMapVI = require('./GenshinData/TextMap/TextMapVI.json')

export const languageMap = {
  chs: TextMapCHS,
  cht: TextMapCHT,
  de: TextMapDE,
  en: TextMapEN,
  es: TextMapES,
  fr: TextMapFR,
  id: TextMapID,
  ja: TextMapJP,
  ko: TextMapKR,
  pt: TextMapPT,
  ru: TextMapRU,
  th: TextMapTH,
  vi: TextMapVI
} as const

export function nameToKey(name: string) {
  if (!name) name = ""
  return name.replace(/[^a-zA-Z ]/g,'').split(" ").map(str => str.charAt(0).toUpperCase() + str.slice(1)).join('')
}

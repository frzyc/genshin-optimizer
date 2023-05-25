import { readDMJSON } from './util'

export const TextMapCHS = JSON.parse(readDMJSON('TextMap/TextMapCHS.json'))
export const TextMapCHT = JSON.parse(readDMJSON('TextMap/TextMapCHT.json'))
export const TextMapDE = JSON.parse(readDMJSON('TextMap/TextMapDE.json'))
export const TextMapEN = JSON.parse(readDMJSON('TextMap/TextMapEN.json'))
export const TextMapES = JSON.parse(readDMJSON('TextMap/TextMapES.json'))
export const TextMapFR = JSON.parse(readDMJSON('TextMap/TextMapFR.json'))
export const TextMapID = JSON.parse(readDMJSON('TextMap/TextMapID.json'))
export const TextMapIT = JSON.parse(readDMJSON('TextMap/TextMapIT.json'))
export const TextMapJP = JSON.parse(readDMJSON('TextMap/TextMapJP.json'))
export const TextMapKR = JSON.parse(readDMJSON('TextMap/TextMapKR.json'))
export const TextMapPT = JSON.parse(readDMJSON('TextMap/TextMapPT.json'))
export const TextMapRU = JSON.parse(readDMJSON('TextMap/TextMapRU.json'))
export const TextMapTH = JSON.parse(readDMJSON('TextMap/TextMapTH.json'))
export const TextMapTR = JSON.parse(readDMJSON('TextMap/TextMapTR.json'))
export const TextMapVI = JSON.parse(readDMJSON('TextMap/TextMapVI.json'))

export const languageMap = {
  chs: TextMapCHS,
  cht: TextMapCHT,
  de: TextMapDE,
  en: TextMapEN,
  es: TextMapES,
  fr: TextMapFR,
  id: TextMapID,
  it: TextMapIT,
  ja: TextMapJP,
  ko: TextMapKR,
  pt: TextMapPT,
  ru: TextMapRU,
  th: TextMapTH,
  tr: TextMapTR,
  vi: TextMapVI,
} as const

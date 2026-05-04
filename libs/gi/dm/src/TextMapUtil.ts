import type { Language } from '@genshin-optimizer/common/pipeline'
import { readDMJSON } from './util'

export const TextMapCHS = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumCHS.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapCHS.json')),
}
export const TextMapCHT = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumCHT.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapCHT.json')),
}
export const TextMapDE = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumDE.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapDE.json')),
}
export const TextMapEN = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumEN.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapEN.json')),
}
export const TextMapES = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumES.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapES.json')),
}
export const TextMapFR = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumFR.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapFR.json')),
}
export const TextMapID = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumID.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapID.json')),
}
export const TextMapIT = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumIT.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapIT.json')),
}
export const TextMapJP = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumJP.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapJP.json')),
}
export const TextMapKR = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumKR.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapKR.json')),
}
export const TextMapPT = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumPT.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapPT.json')),
}
export const TextMapRU = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumRU_0.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumRU_1.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapRU_0.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapRU_1.json')),
}
export const TextMapTH = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumTH_0.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumTH_1.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapTH_0.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapTH_1.json')),
}
export const TextMapTR = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumTR.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapTR.json')),
}
export const TextMapVI = {
  ...JSON.parse(readDMJSON('TextMap/TextMap_MediumVI.json')),
  ...JSON.parse(readDMJSON('TextMap/TextMapVI.json')),
}

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
} as Record<Language, Record<string, string>>

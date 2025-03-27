import type { Language } from '@genshin-optimizer/common/pipeline'
import { readTextmapJSON } from './util'

export const TextMapCHS = readTextmapJSON('TextMap/TextMapCHS.json')
export const TextMapCHT = readTextmapJSON('TextMap/TextMapCHT.json')
export const TextMapDE = readTextmapJSON('TextMap/TextMapDE.json')
export const TextMapEN = readTextmapJSON('TextMap/TextMapEN.json')
export const TextMapES = readTextmapJSON('TextMap/TextMapES.json')
export const TextMapFR = readTextmapJSON('TextMap/TextMapFR.json')
export const TextMapID = readTextmapJSON('TextMap/TextMapID.json')
export const TextMapIT = readTextmapJSON('TextMap/TextMapIT.json')
export const TextMapJP = readTextmapJSON('TextMap/TextMapJP.json')
export const TextMapKR = readTextmapJSON('TextMap/TextMapKR.json')
export const TextMapPT = readTextmapJSON('TextMap/TextMapPT.json')
export const TextMapRU = readTextmapJSON('TextMap/TextMapRU.json')
export const TextMapTH = {
  ...readTextmapJSON('TextMap/TextMapTH_0.json'),
  ...readTextmapJSON('TextMap/TextMapTH_1.json'),
}
export const TextMapTR = readTextmapJSON('TextMap/TextMapTR.json')
export const TextMapVI = readTextmapJSON('TextMap/TextMapVI.json')

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

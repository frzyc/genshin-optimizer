import { readFileSync } from 'fs'
import type { Language } from '@genshin-optimizer/common/pipeline'

export const PROJROOT_PATH = `${process.env['NX_WORKSPACE_ROOT']}/libs/gi/silly-wisher-names`

export const TextMapCHS = JSON.parse(readJSON('Chinese (Simplified).json'))
export const TextMapCHT = JSON.parse(readJSON('Chinese (Traditional).json'))
export const TextMapDE = JSON.parse(readJSON('German.json'))
export const TextMapEN = JSON.parse(readJSON('English (United States).json'))
export const TextMapES = JSON.parse(readJSON('Spanish.json'))
export const TextMapFR = JSON.parse(readJSON('French.json'))
export const TextMapID = JSON.parse(readJSON('indonesian.json'))
export const TextMapIT = JSON.parse(readJSON('Italian.json'))
export const TextMapJP = JSON.parse(readJSON('Japanese.json'))
export const TextMapKR = JSON.parse(readJSON('Korean.json'))
export const TextMapPT = JSON.parse(readJSON('Portuguese (Brazil).json'))
export const TextMapRU = JSON.parse(readJSON('Russian.json'))
export const TextMapTH = JSON.parse(readJSON('Thai.json'))
export const TextMapTR = JSON.parse(readJSON('Turkish.json'))
export const TextMapVI = JSON.parse(readJSON('Vietnamese.json'))

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

function readJSON(fileName: string) {
  return readFileSync(`${PROJROOT_PATH}/Translated/${fileName}`).toString()
}

import { levenshteinDistance } from '@genshin-optimizer/common/util'
import type { DiscRarityKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscMainStatKeys,
  allDiscSetKeys,
  allDiscSubStatKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
  type DiscSetKey,
} from '@genshin-optimizer/zzz/consts'
import type { ISubstat } from '@genshin-optimizer/zzz/db'
import { misreadCharactersInSubstatMap } from './consts'
import { statMapEngMap } from './enStringMap'

/** small utility function used by most string parsing functions below */
type KeyDist<T extends string> = [T, number]
function getBestKeyDist<T extends string>(hams: Array<KeyDist<T>>) {
  const minHam = Math.min(...hams.map(([, ham]) => ham))
  const keys = hams.filter(([, ham]) => ham === minHam).map(([key]) => key)
  return keys
}
function findBestKeyDist<T extends string>(
  str: string,
  keys: readonly T[]
): T | undefined {
  if (!keys.length) return undefined
  if (keys.length === 1) return keys[0]
  const kdist: Array<KeyDist<T>> = []
  for (const key of keys)
    kdist.push([key, levenshteinDistance(str, statMapEngMap[key] ?? key)])
  return getBestKeyDist(kdist)[0]
}

export function parseSetSlot(texts: string[]) {
  let setKeyStr = '',
    slotKey = ''
  for (const text of texts) {
    const match = /(.+)\[([123456])\]/.exec(text)

    if (match) {
      setKeyStr = match[1]
      slotKey = match[2]
      break
    }
  }
  if (!setKeyStr || !slotKey) return { setKey: undefined, slotKey: undefined }
  const setKeyStrTrimmed = setKeyStr.replace(/\W/g, '')
  const setKey = findBestKeyDist(setKeyStrTrimmed, allDiscSetKeys)

  if (!setKey) return { setKey: undefined, slotKey: undefined }
  return { setKey, slotKey: slotKey as DiscSlotKey }
}
export function parseSet(texts: string[]) {
  const kdist: Array<KeyDist<DiscSetKey>> = []
  for (const text of texts) {
    for (const key of allDiscSetKeys) {
      const setKeyStrTrimmed = text.replace(/\W/g, '')
      kdist.push([key, levenshteinDistance(setKeyStrTrimmed, key)])
    }
  }

  const setKeys = getBestKeyDist(kdist)
  return setKeys[0]
}
export function parseLvlRarity(texts: string[]) {
  let level = -1,
    maxLvl = -1
  for (const text of texts) {
    const match = /Lv.\s*([01][0-9])\/([01][0-9])/.exec(text)
    if (match) {
      level = parseInt(match[1])
      maxLvl = parseInt(match[2])
      break
    }
  }
  if (level === -1 || maxLvl === -1)
    return { level: undefined, rarity: undefined }
  const rarity = Object.entries(discMaxLevel).find(
    ([, max]) => maxLvl === max
  )?.[0] as DiscRarityKey
  if (!rarity) return { level: undefined, rarity: undefined }
  return { level, rarity }
}
export function parseMainStatKeys(texts: string[], slotKey?: DiscSlotKey) {
  const keys = slotKey ? discSlotToMainStatKeys[slotKey] : allDiscMainStatKeys
  if (keys.length === 1) return keys[0]
  for (const text of texts) {
    const isPercent = text.includes('%')
    const filteredKeys = keys.filter((key) => isPercent === key.endsWith('_'))
    for (const key of filteredKeys) {
      if (text.includes(statMapEngMap[key])) return key
    }
  }
  return undefined
}

export function parseSubstats(texts: string[]): ISubstat[] {
  const substats: ISubstat[] = []
  for (let text of texts) {
    // Apply OCR character corrections (e.g., '#' → '+') before parsing substats
    for (const { pattern, replacement } of misreadCharactersInSubstatMap) {
      text = text.replace(pattern, replacement)
    }
    const isPercent = text.includes('%')
    const match = /([a-zA-Z\s]+)\s*(\+(\d))?/.exec(text)
    if (match) {
      const statStr = match[1].trim()
      const key = findBestKeyDist(
        statStr,
        allDiscSubStatKeys.filter((key) => isPercent === key.endsWith('_'))
      )
      if (!key) continue
      substats.push({
        key,
        upgrades: match[3] ? parseInt(match[3]) + 1 : 1,
      })
    }
  }
  return substats.slice(0, 4)
}

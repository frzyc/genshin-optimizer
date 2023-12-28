import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationCharacterKey,
  MainStatKey,
} from '@genshin-optimizer/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allMainStatKeys,
  allSubstatKeys,
} from '@genshin-optimizer/consts'
import type { ISubstat } from '@genshin-optimizer/gi-good'
import { levenshteinDistance, unit } from '@genshin-optimizer/util'
import { artSlotNames, statMap } from './enStringMap'

/** small utility function used by most string parsing functions below */
export type KeyDist<T extends string> = [T, number]
export function getBestKeyDist<T extends string>(hams: Array<KeyDist<T>>) {
  const minHam = Math.min(...hams.map(([, ham]) => ham))
  const keys = hams.filter(([, ham]) => ham === minHam).map(([key]) => key)
  return new Set(keys)
}

export function parseSetKeys(texts: string[]): Set<ArtifactSetKey> {
  const kdist: Array<KeyDist<ArtifactSetKey>> = []
  for (const text of texts)
    for (const key of allArtifactSetKeys)
      kdist.push([
        key,
        levenshteinDistance(
          text.replace(/\W/g, ''),
          key //TODO: use the translated set name?
        ),
      ])
  return getBestKeyDist(kdist)
}

export function parseSlotKeys(texts: string[]): Set<ArtifactSlotKey> {
  const kdist: Array<KeyDist<ArtifactSlotKey>> = []
  for (const text of texts)
    for (const key of allArtifactSlotKeys)
      kdist.push([
        key,
        levenshteinDistance(
          text.replace(/\W/g, ''),
          artSlotNames[key].replace(/\W/g, '')
        ),
      ])
  return getBestKeyDist(kdist)
}
export function parseMainStatKeys(texts: string[]): Set<MainStatKey> {
  const kdist: Array<KeyDist<MainStatKey>> = []
  for (const text of texts)
    for (const key of allMainStatKeys) {
      const statStr = statMap[key]?.toLowerCase()
      if (statStr.length <= 3) {
        if (text.toLowerCase().includes(statStr ?? '')) kdist.push([key, 0])
      } else
        kdist.push([
          key,
          levenshteinDistance(
            text.replace(/\W/g, ''),
            (statMap[key] ?? '').replace(/\W/g, '')
          ),
        ])
    }
  return getBestKeyDist(kdist)
}
export function parseMainStatValues(
  texts: string[]
): { mainStatValue: number; unit?: string }[] {
  const results: { mainStatValue: number; unit?: string }[] = []
  for (const text of texts) {
    let regex = /(\d+[,|\\.]+\d)%/
    let match = regex.exec(text)
    if (match)
      results.push({
        mainStatValue: parseFloat(
          match[1].replace(/,/g, '.').replace(/\.{2,}/g, '.')
        ),
        unit: '%',
      })
    regex = /(\d+[,|\\.]\d{3}|\d{2,3})/
    match = regex.exec(text)
    if (match)
      results.push({
        mainStatValue: parseInt(match[1].replace(/[,|\\.]+/g, '')),
      })
  }
  return results
}

export function parseSubstats(texts: string[]): ISubstat[] {
  const matches: ISubstat[] = []
  for (let text of texts) {
    text = text.replace(/^[\W]+/, '').replace(/\n/, '')
    //parse substats
    allSubstatKeys.forEach((key) => {
      const name = statMap[key]
      const regex =
        unit(key) === '%'
          ? new RegExp(name + '\\s*\\+\\s*(\\d+[\\.|,]+\\d)%', 'im')
          : new RegExp(name + '\\s*\\+\\s*(\\d+,\\d+|\\d+)($|\\s)', 'im')
      const match = regex.exec(text)
      if (match)
        matches.push({
          key,
          value: parseFloat(
            match[1].replace(/,/g, '.').replace(/\.{2,}/g, '.')
          ),
        })
    })
  }
  return matches.slice(0, 4)
}

export function parseLocation(texts: string[]): LocationCharacterKey {
  const kdist: Array<KeyDist<LocationCharacterKey>> = []
  for (let text of texts) {
    if (!text) continue
    const colonInd = text.indexOf(':')
    if (colonInd !== -1) text = text.slice(colonInd + 1)
    if (!text) continue

    for (const key of allLocationCharacterKeys)
      kdist.push([
        key,
        levenshteinDistance(
          text.replace(/\W/g, ''),
          key //TODO: use the translated character name?
        ),
      ])
  }

  // traveler is the default value when we don't recognize the name
  kdist.push(['Traveler', 8])
  const [char] = getBestKeyDist(kdist)
  return char
}

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
import { hammingDistance, unit } from '@genshin-optimizer/util'
import { artSlotNames, statMap } from './enStringMap'

/** small utility function used by most string parsing functions below */
export type Ham<T extends string> = [T, number]
export function getBestHamming<T extends string>(hams: Array<Ham<T>>) {
  const minHam = Math.min(...hams.map(([, ham]) => ham))
  const keys = hams.filter(([, ham]) => ham === minHam).map(([key]) => key)
  return new Set(keys)
}

export function parseSetKeys(texts: string[]): Set<ArtifactSetKey> {
  const hams: Array<Ham<ArtifactSetKey>> = []
  for (const text of texts)
    for (const key of allArtifactSetKeys)
      hams.push([
        key,
        hammingDistance(
          text.replace(/\W/g, ''),
          key //TODO: use the translated set name?
        ),
      ])
  return getBestHamming(hams)
}

export function parseSlotKeys(texts: string[]): Set<ArtifactSlotKey> {
  const hams: Array<Ham<ArtifactSlotKey>> = []
  for (const text of texts)
    for (const key of allArtifactSlotKeys)
      hams.push([
        key,
        hammingDistance(
          text.replace(/\W/g, ''),
          artSlotNames[key].replace(/\W/g, '')
        ),
      ])
  return getBestHamming(hams)
}
export function parseMainStatKeys(texts: string[]): Set<MainStatKey> {
  const hams: Array<Ham<MainStatKey>> = []
  for (const text of texts)
    for (const key of allMainStatKeys) {
      const statStr = statMap[key]?.toLowerCase()
      if (statStr.length <= 3) {
        if (text.toLowerCase().includes(statStr ?? '')) hams.push([key, 0])
      } else
        hams.push([
          key,
          hammingDistance(
            text.replace(/\W/g, ''),
            (statMap[key] ?? '').replace(/\W/g, '')
          ),
        ])
    }
  return getBestHamming(hams)
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
  const hams: Array<Ham<LocationCharacterKey>> = []
  for (let text of texts) {
    if (!text) continue
    const colonInd = text.indexOf(':')
    if (colonInd !== -1) text = text.slice(colonInd + 1)
    if (!text) continue

    for (const key of allLocationCharacterKeys)
      hams.push([
        key,
        hammingDistance(
          text.replace(/\W/g, ''),
          key //TODO: use the translated character name?
        ),
      ])
  }
  const [key] = hams.reduce(
    (accu: Ham<LocationCharacterKey>, curr: Ham<LocationCharacterKey>) => {
      const [, val] = accu
      const [, curVal] = curr
      if (curVal < val) return curr
      return accu
    },
    [
      'Traveler', // traveler is the default value when we don't recognize the name
      8,
    ] as [LocationCharacterKey, number]
  )
  return key
}

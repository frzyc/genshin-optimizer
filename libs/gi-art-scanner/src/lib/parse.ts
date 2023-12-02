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

export function parseSetKeys(texts: string[]): Set<ArtifactSetKey> {
  const results = new Set<ArtifactSetKey>([])
  for (const text of texts)
    for (const key of allArtifactSetKeys)
      if (
        hammingDistance(
          text.replace(/\W/g, ''),
          key //TODO: use the translated set name?
        ) <= 2
      )
        results.add(key)
  return results
}

export function parseSlotKeys(texts: string[]): Set<ArtifactSlotKey> {
  const results = new Set<ArtifactSlotKey>()
  for (const text of texts)
    for (const key of allArtifactSlotKeys)
      if (
        hammingDistance(
          text.replace(/\W/g, ''),
          artSlotNames[key].replace(/\W/g, '')
        ) <= 2
      )
        results.add(key)
  return results
}
export function parseMainStatKeys(texts: string[]): Set<MainStatKey> {
  const results = new Set<MainStatKey>([])
  for (const text of texts)
    for (const key of allMainStatKeys) {
      if (text.toLowerCase().includes(statMap[key]?.toLowerCase() ?? ''))
        results.add(key)
      //use fuzzy compare on the ... Bonus texts. heal_ is included.
      if (
        key.includes('_bonu') &&
        hammingDistance(
          text.replace(/\W/g, ''),
          (statMap[key] ?? '').replace(/\W/g, '')
        ) <= 1
      )
        results.add(key)
    }
  return results
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

type Ham = [LocationCharacterKey, number]
export function parseLocation(texts: string[]): LocationCharacterKey {
  const hams: Array<Ham> = []
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
    (accu: Ham, curr: Ham) => {
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

import { ColorText } from '@genshin-optimizer/common/ui'
import { getUnitStr, objKeyMap } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSlotKeys,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import type { IArtifact, ISubstat } from '@genshin-optimizer/gi/good'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  artDisplayValue,
  getMainStatDisplayValue,
  getMainStatDisplayValues,
  getSubstatRolls,
} from '@genshin-optimizer/gi/util'
import type { ReactNode } from 'react'
import { statMap } from './enStringMap'

export type TextKey =
  | 'slotKey'
  | 'mainStatKey'
  | 'mainStatVal'
  | 'rarity'
  | 'level'
  | 'substats'
  | 'unactivatedSubstats'
  | 'setKey'
  | 'location'
  | 'lock'

export function findBestArtifact(
  rarities: Set<number>,
  textSetKeys: Set<ArtifactSetKey>,
  slotKeys: Set<ArtifactSlotKey>,
  substats: ISubstat[],
  unactivatedSubstats: ISubstat[],
  mainStatKeys: Set<MainStatKey>,
  mainStatValues: { mainStatValue: number; unit?: string }[],
  location: LocationKey,
  lock = false
): [IArtifact, Partial<Record<TextKey, ReactNode>>] {
  const texts = {
    lock: detectedText(lock, 'Lock', (value) =>
      value ? 'Locked' : 'Unlocked'
    ),
  } as Partial<Record<TextKey, ReactNode>>
  if (location)
    texts.location = detectedText(location, 'Location', (value) => value)
  if (unactivatedSubstats.length) {
    substats.splice(3, unactivatedSubstats.length)
  }

  const relevantSetKey: ArtifactSetKey[] = textSetKeys.size
    ? [...textSetKeys]
    : ['EmblemOfSeveredFate']

  let bestScore = -1,
    bestArtifacts: IArtifact[] = [
      {
        setKey: 'EmblemOfSeveredFate',
        rarity: 5,
        level: 0,
        slotKey: 'flower',
        mainStatKey: 'hp',
        substats: [],
        location: location ?? '',
        lock,
        unactivatedSubstats: [],
      },
    ]

  // Rate each rarity
  const rarityRates = objKeyMap(allArtifactRarityKeys, (rarity) => {
    let score = 0
    if (textSetKeys.size) {
      const count = [...textSetKeys].reduce(
        (count, set) =>
          count + (allStats.art.data[set].rarities.includes(rarity) ? 1 : 0),
        0
      )
      score += count / textSetKeys.size
    }
    if (rarities.has(rarity)) score++
    if (substats.length) {
      const count = substats.reduce(
        (count, substat) =>
          count +
          (getSubstatRolls(substat.key as SubstatKey, substat.value, rarity)
            .length
            ? 1
            : 0),
        0
      )
      score += (count / substats.length) * 2
    }
    return score
  })

  // Test all *probable* combinations
  for (const slotKey of allArtifactSlotKeys) {
    for (const mainStatKey of artSlotMainKeys[slotKey]) {
      const mainStatUnit = getUnitStr(mainStatKey)
      const mainStatFixed = mainStatUnit === '%' ? 1 : 0
      const mainStatOffset = mainStatUnit === '%' ? 0.1 : 1
      const mainStatScore =
        (slotKeys.has(slotKey) ? 1 : 0) +
        (mainStatKeys.has(mainStatKey) ? 1 : 0)
      const relevantMainStatValues = mainStatValues
        .filter((value) => value.unit !== '%' || mainStatUnit === '%') // Ignore "%" text if key isn't "%"
        .map((value) => value.mainStatValue)
      for (const [rarityString, rarityIndividualScore] of Object.entries(
        rarityRates
      )) {
        const rarity = parseInt(rarityString) as ArtifactRarity
        const setKeys = relevantSetKey.filter((setKey) =>
          allStats.art.data[setKey].rarities.includes(rarity)
        )
        const rarityScore = mainStatScore + rarityIndividualScore

        if (rarityScore + 2 < bestScore) continue // Early bail out

        for (const minimumMainStatValue of relevantMainStatValues) {
          const values = getMainStatDisplayValues(rarity, mainStatKey)
          const level = Math.max(
            0,
            values.findIndex(
              (level) => level + mainStatOffset >= minimumMainStatValue
            )
          )
          const mainStatVal = values[level]
          const mainStatValScore =
            rarityScore +
            (mainStatVal.toFixed(mainStatFixed) ===
            minimumMainStatValue.toFixed(mainStatFixed)
              ? 1
              : 0)

          for (const setKey of setKeys) {
            const score = mainStatValScore + (textSetKeys.has(setKey) ? 1 : 0)
            if (score >= bestScore) {
              if (score > bestScore) bestArtifacts = []
              bestScore = score
              bestArtifacts.push({
                setKey,
                rarity,
                level,
                slotKey,
                mainStatKey,
                substats: [],
                location: location ?? '',
                lock,
                unactivatedSubstats: [],
              })
            }
          }
        }
        if (rarityScore >= bestScore) {
          const level = 0
          for (const setKey of setKeys) {
            const score = rarityScore + (textSetKeys.has(setKey) ? 1 : 0)

            if (score > bestScore) bestArtifacts = []
            bestScore = score
            bestArtifacts.push({
              setKey,
              rarity,
              level,
              slotKey,
              mainStatKey,
              substats: [],
              location: location ?? '',
              lock,
              unactivatedSubstats: [],
            })
          }
        }
      }
    }
  }

  const chosen = {
    setKey: new Set(),
    rarity: new Set(),
    level: new Set(),
    slotKey: new Set(),
    mainStatKey: new Set(),
    mainStatVal: new Set(),
  } as Partial<Record<TextKey, Set<string>>>

  const result = bestArtifacts[0],
    resultMainStatVal = getMainStatDisplayValue(
      result.mainStatKey,
      result.rarity,
      result.level
    )!
  result.substats = substats.filter(
    (substat, i) =>
      substat.key !== result.mainStatKey &&
      substats.slice(0, i).every((other) => other.key !== substat.key)
  )

  result.unactivatedSubstats = unactivatedSubstats.filter(
    (substat) => substat.key !== result.mainStatKey
  )

  for (let i = result.substats.length; i < 4; i++)
    result.substats.push({ key: '', value: 0 })

  for (const other of bestArtifacts) {
    chosen.setKey!.add(other.setKey)
    chosen.rarity!.add(other.rarity as any)
    chosen.level!.add(other.level as any)
    chosen.slotKey!.add(other.slotKey)
    chosen.mainStatKey!.add(other.mainStatKey)
  }

  function unknownText<T>(
    value: T,
    name: ReactNode,
    text: (arg: T) => ReactNode
  ) {
    return (
      <>
        Unknown {name} : Set to{' '}
        <ColorText color="error">{text(value)}</ColorText>
      </>
    )
  }
  function ambiguousText<T>(
    value: T,
    available: T[],
    name: ReactNode,
    text: (arg: T) => ReactNode
  ) {
    return (
      <>
        Ambiguous {name} <ColorText color="error">{text(value)}</ColorText> :
        May also be{' '}
        {available
          .filter((v) => v !== value)
          .map((value, index) => (
            <>
              <b>{index > 0 ? '/' : ''}</b>
              <ColorText color="warning">{text(value)}</ColorText>
            </>
          ))}
      </>
    )
  }
  function detectedText<T>(
    value: T,
    name: ReactNode,
    text: (arg: T) => ReactNode
  ) {
    return (
      <>
        Detected {name} <ColorText color="success">{text(value)}</ColorText>
      </>
    )
  }
  function inferredText<T>(
    value: T,
    name: ReactNode,
    text: (arg: T) => ReactNode
  ) {
    return (
      <>
        Inferred {name} <ColorText color="warning">{text(value)}</ColorText>
      </>
    )
  }

  function addText(
    key: TextKey,
    available: Set<any>,
    name: ReactNode,
    text: (value: unknown) => ReactNode
  ) {
    const recommended = new Set(
      [...chosen[key]!].filter((value) => available.has(value))
    )
    const resKey = result[key as keyof IArtifact]
    if (recommended.size > 1)
      texts[key] = ambiguousText(resKey, [...available], name, text)
    else if (recommended.size === 1)
      texts[key] = detectedText(resKey, name, text)
    else if (chosen[key]!.size > 1) texts[key] = unknownText(resKey, name, text)
    else texts[key] = inferredText(resKey, name, text)
  }

  addText('setKey', textSetKeys, 'Set', (value) => (
    <Translate ns="artifactNames_gen" key18={value as string} />
  ))
  addText('rarity', rarities, 'Rarity', (value) => (
    <>
      {value} {value !== 1 ? 'Stars' : 'Star'}
    </>
  ))
  addText('slotKey', slotKeys, 'Slot', (value) => (
    <Translate ns="artifact" key18={`slotName.${value}`} />
  ))
  addText('mainStatKey', mainStatKeys, 'Main Stat', (value) => (
    <span>{statMap[value as string]}</span>
  ))
  texts.substats = (
    <>
      {result.substats
        .filter((substat) => substat.key !== '')
        .map((substat, i) => (
          <div key={i}>
            {detectedText(substat, 'Sub Stat', (value) => (
              <>
                {statMap[value.key]}+
                {artDisplayValue(value.value, getUnitStr(value.key))}
                {getUnitStr(value.key)}
              </>
            ))}
          </div>
        ))}
    </>
  )

  texts.unactivatedSubstats = (
    <>
      {result.unactivatedSubstats
        .filter((substat) => substat.key !== '')
        .map((substat, i) => (
          <div key={i}>
            {detectedText(substat, 'Unactivated Sub Stat', (value) => (
              <>
                {statMap[value.key]}+
                {artDisplayValue(value.value, getUnitStr(value.key))}
                {getUnitStr(value.key)}
              </>
            ))}
          </div>
        ))}
    </>
  )

  const valueStrFunc = (value: number) => (
    <>
      {artDisplayValue(value, getUnitStr(result.mainStatKey))}
      {getUnitStr(result.mainStatKey)}
    </>
  )
  const toFixed = getUnitStr(result.mainStatKey) === '%' ? 1 : 0
  if (
    mainStatValues.find(
      (value) =>
        value.mainStatValue.toFixed(toFixed) ===
        resultMainStatVal.toFixed(toFixed)
    )
  ) {
    if (mainStatKeys.has(result.mainStatKey)) {
      texts.level = detectedText(result.level, 'Level', (value) => '+' + value)
      texts.mainStatVal = detectedText(
        resultMainStatVal,
        'Main Stat value',
        valueStrFunc
      )
    } else {
      texts.level = inferredText(result.level, 'Level', (value) => '+' + value)
      texts.mainStatVal = inferredText(
        resultMainStatVal,
        'Main Stat value',
        valueStrFunc
      )
    }
  } else {
    texts.level = unknownText(result.level, 'Level', (value) => '+' + value)
    texts.mainStatVal = unknownText(
      resultMainStatVal,
      'Main Stat value',
      valueStrFunc
    )
  }

  return [result, texts]
}

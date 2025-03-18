import {
  getRandomElementFromArray,
  getRandomIntInclusive,
  getUnitStr,
  range,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import type {
  RelicCavernSetKey,
  RelicSetKey,
  RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import {
  type RelicMainStatKey,
  type RelicRarityKey,
  type RelicSubStatKey,
  allRelicCavernSetKeys,
  allRelicCavernSlotKeys,
  allRelicPlanarSetKeys,
  allRelicPlanarSlotKeys,
  allRelicRarityKeys,
  allRelicSetKeys,
  allRelicSubStatKeys,
  isPlanarRelicSetKey,
  relicMaxLevel,
  relicSlotToMainStatKeys,
  relicSubstatRollData,
} from '@genshin-optimizer/sr/consts'
import type { IRelic, ISubstat } from '@genshin-optimizer/sr/srod'
import { allStats } from '@genshin-optimizer/sr/stats'

export function getRelicMainStatVal(
  rarity: RelicRarityKey,
  statKey: RelicMainStatKey,
  level: number
) {
  const { base, add } = allStats.relic.main[rarity][statKey] ?? {}
  if (base === undefined || add === undefined)
    throw new Error(
      `Attempted to get relic main stat value that doesn't exist for a level ${level} ${rarity}-star, ${statKey} relic.`
    )
  return base + add * level
}

export function getRelicMainStatDisplayVal(
  rarity: RelicRarityKey,
  statKey: RelicMainStatKey,
  level: number
) {
  return toPercent(
    getRelicMainStatVal(rarity, statKey, level),
    statKey
  ).toFixed(statToFixed(statKey))
}
export function statToFixed(statKey: RelicMainStatKey | RelicSubStatKey) {
  return statKeyToFixed(statKey)
}

// TODO: Update this with proper corrected rolls
export function getSubstatValue(
  rarity: RelicRarityKey,
  statKey: RelicSubStatKey,
  type: 'low' | 'med' | 'high' = 'high',
  round = true
) {
  const { base, step } = allStats.relic.sub[rarity][statKey] ?? {}
  if (base === undefined || step === undefined)
    throw new Error(
      `Attempted to get relic sub stat value that doesn't exist for a ${rarity}-star relic with substat ${statKey}.`
    )
  const steps = type === 'low' ? 0 : type === 'med' ? 1 : 2
  const value = base + steps * step
  return round ? roundStat(value, statKey) : value
}

// TODO: Update this with proper corrected rolls
export function getSubstatRange(
  rarity: RelicRarityKey,
  statKey: RelicSubStatKey,
  round = true
) {
  const { numUpgrades } = relicSubstatRollData[rarity]
  const high =
    getSubstatValue(rarity, statKey, 'high', false) * (numUpgrades + 1)
  return {
    low: getSubstatValue(rarity, statKey, 'low', round),
    high: round ? roundStat(high, statKey) : high,
  }
}

export function randomizeRelic(base: Partial<IRelic> = {}): IRelic {
  const setKey = base.setKey ?? getRandomElementFromArray(allRelicSetKeys)

  const rarity = base.rarity ?? getRandomElementFromArray(allRelicRarityKeys)
  const slot: RelicSlotKey =
    base.slotKey ??
    getRandomElementFromArray(
      [...(allRelicPlanarSetKeys as readonly string[])].includes(setKey)
        ? allRelicPlanarSlotKeys
        : allRelicCavernSlotKeys
    )
  const mainStatKey: RelicMainStatKey =
    base.mainStatKey ?? getRandomElementFromArray(relicSlotToMainStatKeys[slot])
  const level = base.level ?? getRandomIntInclusive(0, relicMaxLevel[rarity])
  const substats: ISubstat[] = [0, 1, 2, 3].map(() => ({ key: '', value: 0 }))

  const { low, high } = relicSubstatRollData[rarity]
  const totRolls = Math.floor(level / 3) + getRandomIntInclusive(low, high)
  const numOfInitialSubstats = Math.min(totRolls, 4)
  const numUpgradesOrUnlocks = totRolls - numOfInitialSubstats

  const RollStat = (substat: RelicSubStatKey): number =>
    allStats.relic.sub[rarity][substat].base +
    getRandomElementFromArray(range(0, 2)) *
      allStats.relic.sub[rarity][substat].step

  let remainingSubstats = allRelicSubStatKeys.filter(
    (key) => mainStatKey !== key
  )
  for (const substat of substats.slice(0, numOfInitialSubstats)) {
    substat.key = getRandomElementFromArray(remainingSubstats)
    substat.value = RollStat(substat.key as RelicSubStatKey)
    remainingSubstats = remainingSubstats.filter((key) => key !== substat.key)
  }
  for (let i = 0; i < numUpgradesOrUnlocks; i++) {
    const substat = getRandomElementFromArray(substats)
    substat.value += RollStat(substat.key as any)
  }
  for (const substat of substats)
    if (substat.key) {
      substat.value = roundStat(substat.value, substat.key)
    }

  return {
    setKey,
    rarity,
    slotKey: slot,
    mainStatKey,
    level,
    substats,
    location: base.location ?? '',
    lock: false,
  }
}

/**
 * @deprecated use common-util/roundStat
 */
export function roundStat(
  value: number,
  statKey: RelicMainStatKey | RelicSubStatKey
) {
  return getUnitStr(statKey) === '%'
    ? Math.round(value * 10000) / 10000
    : Math.round(value * 100) / 100
}

// TODO: implement when roll table is added
export function getSubstatSummedRolls(
  rarity: RelicRarityKey,
  key: RelicSubStatKey
): number[] {
  // for now, return min and max range
  return Object.values(getSubstatRange(rarity, key, false)).map((v) =>
    toPercent(v, key)
  )
}

// TODO: implement when roll table is added
export function getSubstatValuesPercent(
  substatKey: RelicSubStatKey,
  rarity: RelicRarityKey
) {
  console.log('getSubstatValuesPercent', substatKey, rarity)
  return []
}

export function getDefaultRelicSlot(setKey: RelicSetKey) {
  if (isCavernRelic(setKey)) return allRelicCavernSlotKeys[0]
  if (isPlanarRelicSetKey(setKey)) return allRelicPlanarSlotKeys[0]
  // noopt
  return allRelicCavernSlotKeys[0]
}

export function isCavernRelic(setKey: RelicSetKey) {
  return allRelicCavernSetKeys.includes(setKey as RelicCavernSetKey)
}

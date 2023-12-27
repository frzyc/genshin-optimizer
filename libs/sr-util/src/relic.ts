import {
  relicSubstatRollData,
  type RelicMainStatKey,
  type RelicRarityKey,
  type RelicSubStatKey,
} from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { toPercent } from '@genshin-optimizer/util'

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
  return toPercent(getRelicMainStatVal(rarity, statKey, level), statKey)
}

export function getSubstatValue(
  rarity: RelicRarityKey,
  statKey: RelicSubStatKey,
  type: 'low' | 'med' | 'high' = 'high'
) {
  const { base, step } = allStats.relic.sub[rarity][statKey] ?? {}
  if (base === undefined || step === undefined)
    throw new Error(
      `Attempted to get relic sub stat value that doesn't exist for a ${rarity}-star relic with substat ${statKey}.`
    )
  const steps = type === 'low' ? 0 : type === 'med' ? 1 : 2
  return base + steps * step
}

export function getSubstatRange(
  rarity: RelicRarityKey,
  statKey: RelicSubStatKey
) {
  const { base, step } = allStats.relic.sub[rarity][statKey] ?? {}
  if (base === undefined || step === undefined)
    throw new Error(
      `Attempted to get relic sub stat value that doesn't exist for a ${rarity}-star relic with substat ${statKey}.`
    )
  const { numUpgrades } = relicSubstatRollData[rarity]
  return { low: base, high: base + step * 2 * numUpgrades }
}

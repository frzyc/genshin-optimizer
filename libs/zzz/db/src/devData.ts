import {
  type DiscRarityKey,
  type DiscSlotKey,
  type DiscSubStatKey,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  allWengineKeys,
  discSlotToMainStatKeys,
  discSubstatRollData,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import type { IDisc, IWengine } from '@genshin-optimizer/zzz/zood'
import { validateDisc } from '@genshin-optimizer/zzz/zood'
import type { ZzzDatabase } from './Database'

const DEV_DISC_COUNT = 1000
const DEV_DISC_RARITY: DiscRarityKey = 'S'
const DEV_DISC_LEVEL = 15

const sRankWengineKeys = allWengineKeys.filter(
  (key) => getWengineStat(key).rarity === 'S'
)

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function randomSubstats(
  mainStatKey: string,
  rarity: DiscRarityKey,
  level: number
): { key: DiscSubStatKey; upgrades: number }[] {
  const { low, high } = discSubstatRollData[rarity]
  const totalUpgrades =
    low + Math.floor(level / 3) + (Math.random() < 0.5 ? 0 : 1)
  const cappedTotal = Math.min(totalUpgrades, high + Math.floor(level / 3))

  const substatKeys = shuffle(
    allDiscSubStatKeys.filter((key) => key !== mainStatKey)
  ).slice(0, 4)

  const upgrades = [1, 1, 1, 1]
  let remaining = cappedTotal - 4
  while (remaining > 0) {
    const i = Math.floor(Math.random() * upgrades.length)
    if (upgrades[i]! < 6) {
      upgrades[i]!++
      remaining--
    }
  }

  return substatKeys.map((key, i) => ({
    key,
    upgrades: upgrades[i]!,
  }))
}

export function randomDevDisc(slotKey?: DiscSlotKey): IDisc {
  const resolvedSlotKey = slotKey ?? pickRandom(allDiscSlotKeys)
  const mainStatKey = pickRandom(discSlotToMainStatKeys[resolvedSlotKey])

  return {
    setKey: pickRandom(allDiscSetKeys),
    slotKey: resolvedSlotKey,
    level: DEV_DISC_LEVEL,
    rarity: DEV_DISC_RARITY,
    mainStatKey,
    substats: randomSubstats(mainStatKey, DEV_DISC_RARITY, DEV_DISC_LEVEL),
    location: '',
    lock: false,
    trash: false,
  }
}

export function maxedDevWengine(
  key: (typeof allWengineKeys)[number]
): IWengine {
  return {
    key,
    level: wengineMaxLevel,
    modification: 5,
    phase: 5,
    location: '',
    lock: false,
  }
}

export function addDevData(database: ZzzDatabase): {
  discsAdded: number
  wenginesAdded: number
} {
  let discsAdded = 0
  for (let i = 0; i < DEV_DISC_COUNT; i++) {
    const disc = validateDisc(randomDevDisc())
    if (!disc) continue
    database.discs.new(disc)
    discsAdded++
  }

  let wenginesAdded = 0
  for (const key of sRankWengineKeys) {
    const wengine = maxedDevWengine(key)
    database.wengines.new(wengine)
    wenginesAdded++
  }

  database.toExtraLocalDB()
  return { discsAdded, wenginesAdded }
}

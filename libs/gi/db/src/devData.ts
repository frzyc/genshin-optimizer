import {
  allArtifactSetKeys,
  allWeaponKeys,
  artMaxLevel,
  validateWeaponLevelAsc,
  type ArtifactSlotKey,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { allStats, getWeaponStat } from '@genshin-optimizer/gi/stats'
import { randomizeArtifact } from '@genshin-optimizer/gi/util'
import type { IArtifact, IWeapon } from '@genshin-optimizer/gi/good'
import type { ArtCharDatabase } from './Database'

const DEV_ART_COUNT = 1000
const DEV_ART_RARITY = 5
const DEV_ART_LEVEL = artMaxLevel[DEV_ART_RARITY]

const fiveStarArtSets = allArtifactSetKeys.filter((key) => {
  if (key.startsWith('Prayers')) return false
  return allStats.art.data[key].rarities.includes(DEV_ART_RARITY)
})

const fiveStarWeaponKeys = allWeaponKeys.filter(
  (key) => getWeaponStat(key).rarity === DEV_ART_RARITY
)

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

export function randomDevArtifact(slotKey?: ArtifactSlotKey): IArtifact {
  const sets = slotKey
    ? fiveStarArtSets.filter((key) =>
        allStats.art.data[key].slots.includes(slotKey)
      )
    : fiveStarArtSets
  return randomizeArtifact({
    setKey: pickRandom(sets),
    rarity: DEV_ART_RARITY,
    level: DEV_ART_LEVEL,
    slotKey,
  })
}

export function maxedDevWeapon(key: WeaponKey): IWeapon {
  const { level, ascension } = validateWeaponLevelAsc(
    90,
    6,
    getWeaponStat(key).rarity
  )
  return {
    key,
    level,
    ascension,
    refinement: 5,
    location: '',
    lock: false,
  }
}

export function addDevData(database: ArtCharDatabase): {
  artsAdded: number
  weaponsAdded: number
} {
  const artsBefore = database.arts.values.length
  for (let i = 0; i < DEV_ART_COUNT; i++) {
    database.arts.new(randomDevArtifact())
  }
  const artsAdded = database.arts.values.length - artsBefore

  let weaponsAdded = 0
  for (const key of fiveStarWeaponKeys) {
    database.weapons.new(maxedDevWeapon(key))
    weaponsAdded++
  }

  database.toExtraLocalDB()
  return { artsAdded, weaponsAdded }
}

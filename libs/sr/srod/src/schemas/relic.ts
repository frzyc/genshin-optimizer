import {
  zodBoundedNumber,
  zodEnum,
  zodNumericLiteral,
} from '@genshin-optimizer/common/database'
import { clamp, pruneOrPadArray } from '@genshin-optimizer/common/util'
import type {
  LocationKey,
  RelicMainStatKey,
  RelicRarityKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import {
  allCharacterKeys,
  allLocationKeys,
  allRelicMainStatKeys,
  allRelicRarityKeys,
  allRelicSetKeys,
  allRelicSlotKeys,
  allRelicSubStatKeys,
  relicMaxLevel,
  relicSlotToMainStatKeys,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import type { IRelic, ISubstat } from '../IRelic'

const relicSetKey = zodEnum(allRelicSetKeys)
const relicSlotKey = zodEnum(allRelicSlotKeys)
const relicRarityKey = zodNumericLiteral(allRelicRarityKeys)
const relicMainStatKey = zodEnum(allRelicMainStatKeys)

const locationKey = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return ''
  if (typeof val !== 'string') return ''
  return allLocationKeys.includes(val as LocationKey) ? val : ''
}, z.string()) as z.ZodType<LocationKey>

const substatSchema = z.object({
  key: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return ''
    if (typeof val !== 'string') return ''
    return allRelicSubStatKeys.includes(val as RelicSubStatKey) ? val : ''
  }, z.string()) as z.ZodType<RelicSubStatKey | ''>,
  value: z.number().catch(0),
})

export const relicSchemaBase = z.object({
  setKey: relicSetKey,
  slotKey: relicSlotKey,
  level: zodBoundedNumber(0, 15, 0),
  rarity: relicRarityKey,
  mainStatKey: relicMainStatKey,
  location: locationKey,
  lock: z.boolean().catch(false),
  substats: z.array(substatSchema).catch([]),
})

function defSub(): ISubstat {
  return { key: '', value: 0 }
}

function parseSubstats(
  obj: unknown,
  rarity: RelicRarityKey,
  getSubstatRange: (
    rarity: RelicRarityKey,
    key: RelicSubStatKey
  ) => { low: number; high: number },
  allowZeroSub = false,
  sortSubs = true
): ISubstat[] {
  if (!Array.isArray(obj)) return new Array(4).fill(null).map(() => defSub())

  let substats = (obj as ISubstat[]).map(({ key = '', value = 0 }) => {
    if (
      !allRelicSubStatKeys.includes(key as RelicSubStatKey) ||
      typeof value !== 'number' ||
      !isFinite(value)
    )
      return defSub()

    if (key) {
      value = key.endsWith('_')
        ? Math.round(value * 1000) / 1000
        : Math.round(value)
      const { low, high } = getSubstatRange(rarity, key as RelicSubStatKey)
      value = clamp(value, allowZeroSub ? 0 : low, high)
    } else {
      value = 0
    }
    return { key, value }
  })

  if (sortSubs)
    substats = substats.sort((a, b) => {
      function getPrio(key: ISubstat['key']) {
        if (!key) return 100
        return allRelicSubStatKeys.indexOf(key)
      }
      return getPrio(a.key) - getPrio(b.key)
    })

  return pruneOrPadArray(substats, 4, defSub())
}

export function validateRelicWithRules(
  obj: unknown,
  getSubstatRange: (
    rarity: RelicRarityKey,
    key: RelicSubStatKey
  ) => { low: number; high: number },
  allowZeroSub = false,
  sortSubs = true
): IRelic | undefined {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const { setKey, rarity, slotKey } = obj as IRelic
  let { level, mainStatKey, substats, location, lock } = obj as IRelic

  if (
    !allRelicSetKeys.includes(setKey) ||
    !allRelicSlotKeys.includes(slotKey) ||
    !allRelicMainStatKeys.includes(mainStatKey) ||
    !allRelicRarityKeys.includes(rarity) ||
    typeof level !== 'number' ||
    level < 0 ||
    level > 15
  )
    return undefined

  level = Math.round(level)
  if (level > relicMaxLevel[rarity]) return undefined

  substats = parseSubstats(
    substats,
    rarity,
    getSubstatRange,
    allowZeroSub,
    sortSubs
  )

  if (substats.find((sub) => sub.key === mainStatKey)) return undefined

  lock = !!lock

  const plausibleMainStats = relicSlotToMainStatKeys[slotKey]
  if (!(plausibleMainStats as RelicMainStatKey[]).includes(mainStatKey)) {
    if (plausibleMainStats.length === 1) mainStatKey = plausibleMainStats[0]
    else return undefined
  }

  if (!location || !allCharacterKeys.includes(location)) location = ''

  return {
    setKey,
    rarity,
    level,
    slotKey,
    mainStatKey,
    substats,
    location,
    lock,
  }
}

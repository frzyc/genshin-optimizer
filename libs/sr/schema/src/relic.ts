import {
  zodBoolean,
  zodBoundedNumber,
  zodEnum,
  zodEnumWithDefault,
  zodNumericLiteral,
} from '@genshin-optimizer/common/database'
import { clamp, pruneOrPadArray } from '@genshin-optimizer/common/util'
import type {
  RelicRarityKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import {
  allLocationKeys,
  allRelicMainStatKeys,
  allRelicRarityKeys,
  allRelicSetKeys,
  allRelicSlotKeys,
  allRelicSubStatKeys,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'

const substatSchema = z.object({
  key: zodEnumWithDefault(
    [...allRelicSubStatKeys, ''] as const,
    ''
  ) as z.ZodType<RelicSubStatKey | ''>,
  value: z.number().catch(0),
})

export const relicSchema = z.object({
  setKey: zodEnum(allRelicSetKeys),
  slotKey: zodEnum(allRelicSlotKeys),
  level: zodBoundedNumber(0, 15, 0),
  rarity: zodNumericLiteral(allRelicRarityKeys) as z.ZodType<RelicRarityKey>,
  mainStatKey: zodEnum(allRelicMainStatKeys),
  location: zodEnumWithDefault(allLocationKeys, ''),
  lock: zodBoolean({ coerce: true }),
  substats: z.array(substatSchema).catch([]),
})

export type IRelic = z.infer<typeof relicSchema>
export type ISubstat = IRelic['substats'][number]

export function parseRelic(obj: unknown): IRelic | undefined {
  const result = relicSchema.safeParse(obj)
  return result.success ? result.data : undefined
}

export function defSub(): ISubstat {
  return { key: '', value: 0 }
}

export function parseSubstats(
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

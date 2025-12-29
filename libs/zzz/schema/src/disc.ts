import {
  zodArray,
  zodBoolean,
  zodBoundedNumber,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import type {
  DiscRarityKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscMainStatKeys,
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  allLocationKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
  discSubstatRollData,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'

export const substatSchema = z.object({
  key: zodEnumWithDefault([...allDiscSubStatKeys, ''] as const, ''),
  upgrades: zodBoundedNumber(0, 5, 0),
})

const substatValidationSchema = z.object({
  key: z.string(),
  upgrades: z.number().default(0),
})

export const discSchema = z.object({
  setKey: zodEnumWithDefault(allDiscSetKeys, allDiscSetKeys[0]),
  slotKey: zodEnumWithDefault(allDiscSlotKeys, '1'),
  level: zodBoundedNumber(0, 15, 0),
  rarity: zodEnumWithDefault(allDiscRarityKeys, 'S'),
  mainStatKey: zodEnumWithDefault(allDiscMainStatKeys, allDiscMainStatKeys[0]),
  substats: zodArray(substatSchema),
  location: zodEnumWithDefault(allLocationKeys, ''),
  lock: zodBoolean(),
  trash: zodBoolean(),
})

export type ISubstat = z.infer<typeof substatSchema>
export type IDisc = z.infer<typeof discSchema>

export function parseSubstats(
  substats: ISubstat[],
  _rarity: DiscRarityKey,
  allowZeroSub = false
): ISubstat[] {
  return substats
    .filter((sub) => sub.key !== '' && (allowZeroSub || sub.upgrades > 0))
    .map((sub) => ({
      key: sub.key as DiscSubStatKey,
      upgrades: sub.upgrades,
    }))
}

export function applyDiscRules(
  data: IDisc,
  allowZeroSub = false
): IDisc | undefined {
  const { slotKey, rarity } = data
  let { level, mainStatKey } = data

  if (level > discMaxLevel[rarity]) level = 0

  const plausibleMainStats = discSlotToMainStatKeys[slotKey]
  if (!plausibleMainStats.includes(mainStatKey)) {
    mainStatKey = plausibleMainStats[0]
  }

  const substats = parseSubstats(data.substats, rarity, allowZeroSub)

  if (substats.find((sub) => sub.key === mainStatKey)) return undefined

  return { ...data, level, mainStatKey, substats }
}

export function parseDisc(obj: unknown): IDisc | undefined {
  const result = discSchema.safeParse(obj)
  return result.success ? result.data : undefined
}

export function validateDisc(
  obj: unknown,
  allowZeroSub = false
): IDisc | undefined {
  const data = parseDisc(obj)
  if (!data) return undefined

  return applyDiscRules(data, allowZeroSub)
}

const discValidationBaseSchema = z.object({
  mainStatKey: z.string(),
  rarity: zodEnumWithDefault(allDiscRarityKeys, 'S'),
  level: z.number().default(0),
  substats: z.array(substatValidationSchema).default([]),
})

export const discValidationSchema = discValidationBaseSchema.superRefine(
  (disc, ctx) => {
    const { mainStatKey, rarity, level, substats } = disc
    const minSubstats = rarity === allDiscRarityKeys[0] ? 3 : 2

    const dupSubIndex = substats.findIndex((sub) => sub.key === mainStatKey)
    if (dupSubIndex > -1) {
      ctx.addIssue({
        code: 'custom',
        path: ['substats', dupSubIndex, 'key'],
        message: `Substat at row ${dupSubIndex + 1} with ${statKeyTextMap[mainStatKey]} is the same as mainstat.`,
      })
    }

    if (substats.length >= minSubstats) {
      const totalUpgrades = substats.reduce(
        (sum, item) => sum + item.upgrades,
        0
      )
      const { low, high } = discSubstatRollData[rarity]
      const lowerBound = low + Math.floor(level / 3)
      const upperBound = high + Math.floor(level / 3)

      if (totalUpgrades > upperBound) {
        ctx.addIssue({
          code: 'custom',
          path: ['substats'],
          message: `${rarity}-rank disc (level ${level}) should have no more than ${upperBound} upgrades. It currently has ${totalUpgrades} upgrades.`,
        })
      } else if (totalUpgrades < lowerBound) {
        ctx.addIssue({
          code: 'custom',
          path: ['substats'],
          message: `${rarity}-rank disc (level ${level}) should have at least ${lowerBound} upgrades. It currently has ${totalUpgrades} upgrades.`,
        })
      }
    } else {
      ctx.addIssue({
        code: 'custom',
        path: ['substats'],
        message: `${rarity}-rank disc (level ${level}) should have at least ${minSubstats} substats. It currently has ${substats.length} substats.`,
      })
    }

    if (substats.length < 4) {
      const substat = substats.find((sub) => sub.upgrades > 1)
      if (substat) {
        const subIndex = substats.indexOf(substat)
        ctx.addIssue({
          code: 'custom',
          path: ['substats', subIndex, 'upgrades'],
          message: `Substat ${statKeyTextMap[substat.key as keyof typeof statKeyTextMap] ?? substat.key} has > 1 upgrade, but not all substats are unlocked.`,
        })
      }
    }
  }
)

export function validateDiscWithErrors(disc: Partial<IDisc>) {
  const validatedDisc = validateDisc(disc)
  const result = discValidationSchema.safeParse(disc)

  const errors = result.success
    ? []
    : result.error.issues.map((issue) => issue.message)

  return { validatedDisc, errors }
}

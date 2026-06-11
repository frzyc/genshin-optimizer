import {
  zodEnumWithDefault,
  zodString,
} from '@genshin-optimizer/common/database'
import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allInfusionAuraElementKeys,
  allMultiOptHitModeKeys,
} from '@genshin-optimizer/gi/consts'
import type { InputPremodKey } from '@genshin-optimizer/gi/wr-types'
import { allInputPremodKeys } from '@genshin-optimizer/gi/wr-types'
import { z } from 'zod'

export const MAX_NAME_LENGTH = 200
export const MAX_DESC_LENGTH = 2000

const bonusStatsSchema = z.preprocess(
  (val) => {
    if (typeof val !== 'object' || val === null) return {}
    const result: Partial<Record<InputPremodKey, number>> = {}
    for (const [key, value] of Object.entries(val)) {
      if (
        allInputPremodKeys.includes(key as InputPremodKey) &&
        typeof value === 'number'
      ) {
        result[key as InputPremodKey] = value
      }
    }
    return result
  },
  z.record(z.string(), z.number())
) as z.ZodType<Partial<Record<InputPremodKey, number>>>

const allReactionKeys = [
  ...allAmpReactionKeys,
  ...allAdditiveReactions,
] as const

const customTargetSchema = z
  .object({
    weight: z.number().positive().catch(1),
    path: z.array(z.string()),
    hitMode: zodEnumWithDefault(allMultiOptHitModeKeys, 'avgHit'),
    reaction: z.enum(allReactionKeys).optional().catch(undefined),
    infusionAura: z
      .enum(allInfusionAuraElementKeys)
      .optional()
      .catch(undefined),
    bonusStats: bonusStatsSchema,
    description: zodString(),
  })
  .refine((ct) => ct.path[0] !== 'custom', {
    message: 'Path cannot start with "custom"',
  })

export type CustomTarget = z.infer<typeof customTargetSchema>
export type BonusStats = CustomTarget['bonusStats']

const customMultiTargetSchema = z.object({
  name: z
    .string()
    .catch('New Custom Target')
    .transform((n) =>
      n.length > MAX_NAME_LENGTH ? n.slice(0, MAX_NAME_LENGTH) : n
    ),
  description: z
    .string()
    .optional()
    .catch(undefined)
    .transform((d) =>
      d && d.length > MAX_DESC_LENGTH ? d.slice(0, MAX_DESC_LENGTH) : d
    ),
  targets: z.array(customTargetSchema).catch([]),
})

export type CustomMultiTarget = z.infer<typeof customMultiTargetSchema>

export function initCustomMultiTarget(index: number): CustomMultiTarget {
  return {
    name: `New Custom Target ${index}`,
    description: undefined,
    targets: [],
  }
}

export function initCustomTarget(path: string[], multi = 1): CustomTarget {
  return {
    weight: multi,
    path,
    hitMode: 'avgHit',
    bonusStats: {},
    description: '',
  }
}

export function validateCustomMultiTarget(
  cmt: unknown
): CustomMultiTarget | undefined {
  const result = customMultiTargetSchema.safeParse(cmt)
  if (!result.success) return undefined

  // Filter out targets that failed the refine (path[0] === 'custom')
  const targets = (cmt as { targets?: unknown[] }).targets
  if (!Array.isArray(targets)) return undefined

  const validatedTargets = targets
    .map((t) => customTargetSchema.safeParse(t))
    .filter((r) => r.success)
    .map((r) => r.data!)

  return {
    ...result.data,
    targets: validatedTargets,
  }
}

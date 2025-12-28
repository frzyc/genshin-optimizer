import { zodNumericLiteral } from '@genshin-optimizer/common/database'
import type {
  LocationKey,
  MilestoneKey,
  PhaseKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allLocationKeys,
  allMilestoneKeys,
  allPhaseKeys,
  allWengineKeys,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'

export const wengineKeySchema = z
  .string()
  .refine((val): val is WengineKey =>
    allWengineKeys.includes(val as WengineKey)
  )

export const phaseKeySchema = zodNumericLiteral(allPhaseKeys)
export const milestoneKeySchema = zodNumericLiteral(allMilestoneKeys)
export const locationKeySchema = z
  .string()
  .refine((val): val is LocationKey =>
    allLocationKeys.includes(val as LocationKey)
  )

export const wengineSchema = z.object({
  key: wengineKeySchema,
  level: z.number().int().min(1).max(wengineMaxLevel),
  phase: phaseKeySchema,
  modification: milestoneKeySchema,
  location: locationKeySchema,
  lock: z.boolean(),
})

export const wengineRecoverySchema = z.object({
  key: wengineKeySchema,
  level: z.preprocess(
    (val) =>
      typeof val === 'number' && val >= 1 && val <= wengineMaxLevel ? val : 1,
    z.number()
  ),
  phase: z.preprocess(
    (val): PhaseKey =>
      typeof val === 'number' && val >= 1 && val <= 5 ? (val as PhaseKey) : 1,
    z.number() as z.ZodType<PhaseKey>
  ),
  modification: z.preprocess(
    (val): MilestoneKey =>
      typeof val === 'number' && val >= 0 && val <= 5
        ? (val as MilestoneKey)
        : 0,
    z.number() as z.ZodType<MilestoneKey>
  ),
  location: z.preprocess(
    (val): LocationKey =>
      allLocationKeys.includes(val as LocationKey) ? (val as LocationKey) : '',
    z.string() as z.ZodType<LocationKey>
  ),
  lock: z.preprocess((val) => !!val, z.boolean()),
})

export interface IWengine {
  key: WengineKey
  level: number
  phase: PhaseKey
  modification: MilestoneKey
  location: LocationKey
  lock: boolean
}

export function parseWengineRecovery(
  obj: unknown
): z.infer<typeof wengineRecoverySchema> | undefined {
  if (typeof obj !== 'object' || obj === null) return undefined

  const result = wengineRecoverySchema.safeParse(obj)
  return result.success ? result.data : undefined
}

export function validateWengine(obj: unknown): IWengine | undefined {
  const data = parseWengineRecovery(obj)
  return data ? (data as IWengine) : undefined
}

export function parseWengineImport(obj: unknown): IWengine {
  return wengineSchema.parse(obj) as IWengine
}

export function safeParseWengineImport(obj: unknown) {
  return wengineSchema.safeParse(obj)
}

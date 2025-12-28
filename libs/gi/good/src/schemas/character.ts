import { zodNumericLiteral } from '@genshin-optimizer/common/database'
import { clamp } from '@genshin-optimizer/common/util'
import type { AscensionKey, CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allAscensionKeys,
  allCharacterKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'

export const characterKeySchema = z
  .string()
  .refine((val): val is CharacterKey =>
    allCharacterKeys.includes(val as CharacterKey)
  )

const ascensionKeySchema = zodNumericLiteral(allAscensionKeys)

export const talentSchema = z.object({
  auto: z.number().int().min(1).max(15),
  skill: z.number().int().min(1).max(15),
  burst: z.number().int().min(1).max(15),
})

export const talentRecoverySchema = z.object({
  auto: z.preprocess(
    (val) => (typeof val === 'number' ? clamp(Math.round(val), 1, 15) : 1),
    z.number()
  ),
  skill: z.preprocess(
    (val) => (typeof val === 'number' ? clamp(Math.round(val), 1, 15) : 1),
    z.number()
  ),
  burst: z.preprocess(
    (val) => (typeof val === 'number' ? clamp(Math.round(val), 1, 15) : 1),
    z.number()
  ),
})

export const characterSchema = z.object({
  key: characterKeySchema,
  level: z.number().int().min(1).max(90),
  constellation: z.number().int().min(0).max(6),
  ascension: ascensionKeySchema,
  talent: talentSchema,
})

export const characterRecoverySchema = z.object({
  key: characterKeySchema,
  level: z.preprocess(
    (val) => (typeof val === 'number' && val >= 1 && val <= 90 ? val : 1),
    z.number()
  ),
  constellation: z.preprocess(
    (val) => (typeof val === 'number' ? clamp(Math.round(val), 0, 6) : 0),
    z.number()
  ),
  ascension: z.preprocess(
    (val): AscensionKey =>
      typeof val === 'number' && val >= 0 && val <= 6
        ? (val as AscensionKey)
        : 0,
    z.number() as z.ZodType<AscensionKey>
  ),
  talent: z.preprocess((val) => {
    if (!val || typeof val !== 'object') {
      return { auto: 1, skill: 1, burst: 1 }
    }
    return val
  }, talentRecoverySchema),
})

export interface ICharacterTalent {
  auto: number
  skill: number
  burst: number
}

export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: AscensionKey
  talent: ICharacterTalent
}

export function isTalentKey(tKey: string): tKey is keyof ICharacterTalent {
  return (['auto', 'skill', 'burst'] as const).includes(
    tKey as keyof ICharacterTalent
  )
}

export type CharacterRecoveryData = z.infer<typeof characterRecoverySchema>

export function parseCharacterRecovery(
  obj: unknown
): CharacterRecoveryData | undefined {
  if (!obj || typeof obj !== 'object') return undefined

  const result = characterRecoverySchema.safeParse(obj)
  return result.success ? result.data : undefined
}

export function parseCharacterImport(obj: unknown) {
  return characterSchema.parse(obj)
}

export function safeParseCharacterImport(obj: unknown) {
  return characterSchema.safeParse(obj)
}

import { zodBoundedNumber, zodEnum } from '@genshin-optimizer/common/database'
import { clamp } from '@genshin-optimizer/common/util'
import {
  type MilestoneKey,
  allCharacterKeys,
  coreByLevel,
  skillByLevel,
  validateLevelMilestone,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'

export const characterSchema = z
  .object({
    key: zodEnum(allCharacterKeys),
    level: zodBoundedNumber(1, 60, 1),
    promotion: zodBoundedNumber(0, 5, 0) as z.ZodType<MilestoneKey>,
    mindscape: zodBoundedNumber(0, 6, 0),
    core: z.number().catch(0),
    dodge: z.number().catch(1),
    basic: z.number().catch(1),
    chain: z.number().catch(1),
    special: z.number().catch(1),
    assist: z.number().catch(1),
    potential: zodBoundedNumber(0, 6, 0),
  })
  .transform((data) => {
    const { sanitizedLevel: level, milestone: promotion } =
      validateLevelMilestone(data.level, data.promotion)

    // Clamp skills to promotion-dependent limits
    const skillMax = skillByLevel(level)
    const coreMax = coreByLevel(level)

    return {
      ...data,
      level,
      promotion,
      core: clamp(data.core, 0, coreMax),
      dodge: clamp(data.dodge, 1, skillMax),
      basic: clamp(data.basic, 1, skillMax),
      chain: clamp(data.chain, 1, skillMax),
      special: clamp(data.special, 1, skillMax),
      assist: clamp(data.assist, 1, skillMax),
    }
  })

export type ICharacter = z.infer<typeof characterSchema>

export const skillKeys = [
  'dodge',
  'basic',
  'chain',
  'special',
  'assist',
] as const
export type SkillKey = (typeof skillKeys)[number]
export type ICharacterSkill = Pick<ICharacter, SkillKey>

export function parseCharacter(obj: unknown): ICharacter | undefined {
  const result = characterSchema.safeParse(obj)
  return result.success ? result.data : undefined
}

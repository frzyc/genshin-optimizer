import {
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
  zodObject,
} from '@genshin-optimizer/common/database'
import { clamp } from '@genshin-optimizer/common/util'
import {
  type AscensionKey,
  type CharacterKey,
  allCharacterKeys,
  talentLimits,
  validateCharLevelAsc,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'

export interface ICharacterTalent {
  auto: number
  skill: number
  burst: number
}

const characterBaseSchema = z.object({
  key: zodEnum(allCharacterKeys),
  level: zodBoundedNumber(1, 90, 1),
  constellation: zodClampedNumber(0, 6, 0),
  ascension: zodBoundedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
  talent: zodObject({
    auto: zodClampedNumber(1, 15, 1),
    skill: zodClampedNumber(1, 15, 1),
    burst: zodClampedNumber(1, 15, 1),
  }),
})

export const characterSchema = characterBaseSchema.transform((data) => {
  const { level, ascension } = validateCharLevelAsc(data.level, data.ascension)

  const talentMax = talentLimits[ascension]
  const talent: ICharacterTalent = {
    auto: clamp(data.talent.auto, 1, talentMax),
    skill: clamp(data.talent.skill, 1, talentMax),
    burst: clamp(data.talent.burst, 1, talentMax),
  }

  return {
    key: data.key as CharacterKey,
    level,
    ascension,
    constellation: data.constellation,
    talent,
  }
})

export type ICharacter = z.infer<typeof characterSchema>

export function isTalentKey(tKey: string): tKey is keyof ICharacterTalent {
  return (['auto', 'skill', 'burst'] as const).includes(
    tKey as keyof ICharacterTalent
  )
}

export function parseCharacter(obj: unknown): ICharacter | undefined {
  const result = characterSchema.safeParse(obj)
  return result.success ? result.data : undefined
}

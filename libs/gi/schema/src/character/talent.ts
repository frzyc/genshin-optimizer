import { clamp } from '@genshin-optimizer/common/util'
import { type AscensionKey, talentLimits } from '@genshin-optimizer/gi/consts'
import type { ICharacterTalent } from './schema'

export function validateTalent(
  ascension: AscensionKey,
  talent: ICharacterTalent
): ICharacterTalent {
  if (talent === null || typeof talent !== 'object') {
    return { auto: 1, skill: 1, burst: 1 }
  } else {
    const clampedTalent: ICharacterTalent = { ...talent }
    for (const [key, value] of Object.entries(clampedTalent)) {
      clampedTalent[key as keyof ICharacterTalent] = clamp(
        value,
        1,
        talentLimits[ascension]
      )
    }
    return clampedTalent
  }
}

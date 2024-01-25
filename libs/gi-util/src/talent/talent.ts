import { talentLimits, type AscensionKey } from '@genshin-optimizer/consts'
import type { ICharacterTalent } from '@genshin-optimizer/gi-good'
import { clamp } from '@genshin-optimizer/util'

export function validateTalent(
  ascension: AscensionKey,
  talent: ICharacterTalent
): ICharacterTalent {
  if (talent === null || typeof talent !== 'object') {
    return { auto: 1, skill: 1, burst: 1 }
  } else {
    // Clamp the character's talent levels according to ascension
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

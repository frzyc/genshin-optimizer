import { clamp } from '@genshin-optimizer/common/util'
import { talentLimits, type AscensionKey } from '@genshin-optimizer/zzz/consts'
import type { ICharacterTalent } from '@genshin-optimizer/zzz/zood'

export function validateTalent(
  ascension: AscensionKey,
  talent: ICharacterTalent
): ICharacterTalent {
  if (talent === null || typeof talent !== 'object') {
    return { basic: 1, special: 1, assist: 1, dodge: 1, chain: 1 }
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

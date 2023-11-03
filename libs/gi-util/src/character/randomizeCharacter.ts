import { allCharacterKeys } from '@genshin-optimizer/consts'
import type { ICharacter } from '@genshin-optimizer/gi-good'
import {
  getRandomElementFromArray,
  getRandomIntInclusive,
} from '@genshin-optimizer/util'
import { validateLevelAsc } from '../level'

export function randomizeCharacter(base: Partial<ICharacter> = {}): ICharacter {
  const key =
    base.key ??
    getRandomElementFromArray(allCharacterKeys.filter((c) => c !== 'Somnia')) // Do not return somnia
  const level = base.level ?? getRandomIntInclusive(1, 90)
  const { ascension } = validateLevelAsc(level, base.ascension ?? 0)
  const constellation = base.constellation ?? getRandomIntInclusive(0, 6)
  const auto = base.talent?.auto ?? getRandomIntInclusive(0, 10)
  const skill = base.talent?.skill ?? getRandomIntInclusive(0, 10)
  const burst = base.talent?.burst ?? getRandomIntInclusive(0, 10)
  return {
    key,
    level,
    ascension,
    constellation,
    talent: {
      auto,
      skill,
      burst,
    },
  }
}

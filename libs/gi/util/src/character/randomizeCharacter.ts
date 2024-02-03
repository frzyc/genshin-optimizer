import {
  getRandomElementFromArray,
  getRandomIntInclusive,
} from '@genshin-optimizer/common/util'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import { validateLevelAsc } from '../level'
import { validateTalent } from '../talent'

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
  const talent = validateTalent(ascension, { auto, skill, burst })
  return {
    key,
    level,
    ascension,
    constellation,
    talent,
  }
}

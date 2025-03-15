import type { AscensionKey } from '@genshin-optimizer/gi/consts'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import type { TeamLoadoutCharacter } from './getTeam'

export function TeamLoadoutCharacterToICharacter(
  character: TeamLoadoutCharacter,
): ICharacter {
  const {
    key,
    level,
    talent_auto,
    talent_burst,
    talent_skill,
    ascension,
    constellation,
  } = character
  return {
    key,
    level,
    ascension: ascension as AscensionKey,
    constellation,
    talent: {
      auto: talent_auto,
      skill: talent_skill,
      burst: talent_burst,
    },
  }
}

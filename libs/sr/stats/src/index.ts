import type {
  NonTrailblazerCharacterKey,
  TrailblazerGenderedKey,
} from '@genshin-optimizer/sr/consts'
import * as allStat_gen from './allStat_gen.json'
import type { AllStats } from './executors/gen-stats/executor'

// Make sure these are type-only imports/exports.
// Importing the executor is quite costly.
export type {
  CharacterDatum,
  LightConeDatum,
  RelicSetDatum,
  SkillTreeNodeBonusStat,
} from './executors/gen-stats/executor'

const allStats = allStat_gen as AllStats

export { allStats }
export type { AllStats }

export function getCharStat(
  ck: NonTrailblazerCharacterKey | TrailblazerGenderedKey
) {
  return allStats.char[ck]
}

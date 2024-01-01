import * as allStat_gen from './allStat_gen.json'
import type { AllStats } from './executors/gen-stats/executor'

// Make sure these are type-only imports/exports.
// Importing the executor is quite costly.
export type {
  CharacterDataGen,
  SkillTreeNodeBonusStat,
} from './executors/gen-stats/executor'

const allStats = allStat_gen as AllStats

export { allStats }
export type { AllStats }

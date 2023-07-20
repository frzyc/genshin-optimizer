import * as allStat_gen from './allStat_gen.json'

// Make sure these are type-only imports/exports.
// Importing the executor is quite costly.
export type {} from './executors/gen-stats/executor'
import type { AllStats } from './executors/gen-stats/executor'

const allStats = allStat_gen as AllStats

export type { AllStats }
export { allStats }

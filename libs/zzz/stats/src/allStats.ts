import * as allStat_gen from './allStat_gen.json'
// Make sure these are type-only imports/exports.
// Importing the executor is quite costly.
import type { AllStats } from './executors/gen-stats/executor'

const allStats = allStat_gen as unknown as AllStats

export { allStats }
export type { AllStats }

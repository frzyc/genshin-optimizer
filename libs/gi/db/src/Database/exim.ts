import type { IArtifact, ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import type { OptConfig } from './DataManagers/OptConfigDataManager'

export const GOSource = 'Genshin Optimizer' as const

function newMergeCounter<T>(): MergeResultCounter<T> {
  return {
    import: 0,
    invalid: [],
    new: [],
    update: [],
    unchanged: [],
    upgraded: [],
    remove: [],
    notInImport: 0,
    beforeMerge: 0,
  }
}
function newImportCounter(): ImportResultCounter {
  return {
    import: 0,
    beforeImport: 0,
  }
}

export function newImportResult(
  source: string,
  keepNotInImport: boolean,
  ignoreDups: boolean,
): ImportResult {
  return {
    type: 'GOOD',
    source,
    artifacts: newMergeCounter(),
    weapons: newMergeCounter(),
    characters: newMergeCounter(),
    builds: newImportCounter(),
    buildTcs: newImportCounter(),
    teams: newImportCounter(),
    teamChars: newImportCounter(),
    keepNotInImport,
    ignoreDups,
  }
}
export type IGO = {
  dbVersion: number
  source: typeof GOSource
  buildSettings?: Array<OptConfig & { id: string }>
  [gokey: string]: unknown
}

export type ImportResultCounter = {
  import: number // total # in file
  beforeImport: number
}

export type MergeResultCounter<T> = {
  import: number // total # in file
  new: T[]
  update: T[] // Use new object
  unchanged: T[] // Use new object
  upgraded: T[]
  remove: T[]
  invalid: T[]
  notInImport: number
  beforeMerge: number
}

export type ImportResult = {
  type: 'GOOD'
  source: string
  artifacts: MergeResultCounter<IArtifact>
  weapons: MergeResultCounter<IWeapon>
  characters: MergeResultCounter<ICharacter>
  builds: ImportResultCounter
  buildTcs: ImportResultCounter
  teams: ImportResultCounter
  teamChars: ImportResultCounter
  keepNotInImport: boolean
  ignoreDups: boolean
}

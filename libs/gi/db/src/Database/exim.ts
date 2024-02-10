import type { IArtifact, IWeapon } from '@genshin-optimizer/gi/good'
import type { IGOCharacter } from '../Interfaces/IGOCharacter'
import type { BuildSetting } from './DataManagers/BuildSettingDataManager'

export const GOSource = 'Genshin Optimizer' as const

function newCounter<T>(): ImportResultCounter<T> {
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

export function newImportResult(
  source: string,
  keepNotInImport: boolean,
  ignoreDups: boolean
): ImportResult {
  return {
    type: 'GOOD',
    source,
    artifacts: newCounter(),
    weapons: newCounter(),
    characters: newCounter(),
    keepNotInImport,
    ignoreDups,
  }
}
export type IGO = {
  dbVersion: number
  source: typeof GOSource
  buildSettings?: Array<BuildSetting & { id: string }>
  [gokey: string]: unknown
}

export type ImportResultCounter<T> = {
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
  artifacts: ImportResultCounter<IArtifact>
  weapons: ImportResultCounter<IWeapon>
  characters: ImportResultCounter<IGOCharacter>
  keepNotInImport: boolean
  ignoreDups: boolean
}

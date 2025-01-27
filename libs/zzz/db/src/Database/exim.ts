import type { IDisc } from '../Interfaces/IDisc'
import type { CharacterData } from './DataManagers/CharacterDataManager'

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
    type: 'ZZZ',
    source,
    discs: newCounter(),
    // TODO:
    // lightCones: newCounter(),
    characters: newCounter(),
    keepNotInImport,
    ignoreDups,
  }
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
  type: 'ZZZ'
  source: string
  discs: ImportResultCounter<IDisc>
  // TODO:
  // lightCones: ImportResultCounter<ILightCone>
  characters: ImportResultCounter<CharacterData>
  keepNotInImport: boolean
  ignoreDups: boolean
}

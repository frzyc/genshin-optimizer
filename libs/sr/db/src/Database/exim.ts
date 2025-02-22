import type { ICharacter, ILightCone, IRelic } from '@genshin-optimizer/sr/srod'

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
    type: 'SR',
    source,
    relics: newCounter(),
    lightCones: newCounter(),
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
  type: 'SR'
  source: string
  relics: ImportResultCounter<IRelic>
  lightCones: ImportResultCounter<ILightCone>
  characters: ImportResultCounter<ICharacter>
  keepNotInImport: boolean
  ignoreDups: boolean
}

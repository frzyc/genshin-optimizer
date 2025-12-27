import type { Database } from '@genshin-optimizer/common/database'
import type { GenderKey } from '@genshin-optimizer/gi/consts'
import { allGenderKeys } from '@genshin-optimizer/gi/consts'
import type { IGOOD } from '@genshin-optimizer/gi/good'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'
import type { IGO, ImportResult } from '../exim'

export interface IDBMeta {
  name: string
  lastEdit: number
  gender: GenderKey
}

function dbMetaInit(database: Database): IDBMeta {
  return {
    name: `Database ${database.storage.getDBIndex()}`,
    lastEdit: 0,
    gender: 'F',
  }
}

export class DBMetaEntry extends DataEntry<
  'dbMeta',
  'dbMeta',
  IDBMeta,
  IDBMeta
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'dbMeta', dbMetaInit, 'dbMeta')
  }
  override validate(obj: any): IDBMeta | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    let { name, lastEdit, gender } = obj
    if (typeof name !== 'string')
      name = `Database ${this.database.storage.getDBIndex()}`
    if (typeof lastEdit !== 'number') console.warn('lastEdit INVALID')
    if (typeof lastEdit !== 'number') lastEdit = 0
    if (!allGenderKeys.includes(gender)) gender = 'F'

    return { name, lastEdit, gender } as IDBMeta
  }
  override importGOOD(go: IGO & IGOOD, _result: ImportResult): void {
    const data = go[this.dataKey]
    if (data) {
      // Don't copy over lastEdit data
      const { lastEdit, ...rest } = data as IDBMeta
      this.set(rest)
    }
  }
}

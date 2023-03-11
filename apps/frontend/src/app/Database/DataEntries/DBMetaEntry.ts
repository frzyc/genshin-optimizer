import type { Gender } from '../../Types/consts'
import { genderKeys } from '../../Types/consts'
import type { ArtCharDatabase } from '../Database'
import { DataEntry } from '../DataEntry'
import type { IGO, IGOOD, ImportResult } from '../exim'

interface IDBMeta {
  name: string
  lastEdit: number
  gender: Gender
}

function dbMetaInit(database: ArtCharDatabase): IDBMeta {
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
  validate(obj: any): IDBMeta | undefined {
    if (typeof obj !== 'object') return
    let { name, lastEdit, gender } = obj
    if (typeof name !== 'string')
      name = `Database ${this.database.storage.getDBIndex()}`
    if (typeof lastEdit !== 'number') console.warn('lastEdit INVALID')
    if (typeof lastEdit !== 'number') lastEdit = 0
    if (!genderKeys.includes(gender)) gender = 'F'

    return { name, lastEdit, gender } as IDBMeta
  }
  importGOOD(go: IGO & IGOOD, _result: ImportResult): void {
    const data = go[this.goKey]
    if (data) {
      // Don't copy over lastEdit data
      const { lastEdit, ...rest } = data as IDBMeta
      this.set(rest)
    }
  }
}

import type { Database } from '@genshin-optimizer/database'
import type { GenderKey } from '@genshin-optimizer/sr-consts'
import { allGenderKeys } from '@genshin-optimizer/sr-consts'
import type { ISrObjectDescription } from '@genshin-optimizer/sr-srod'
import type { ISroDatabase } from '../../Interfaces'
import { DataEntry } from '../DataEntry'
import type { SroDatabase } from '../Database'
import type { ImportResult } from '../exim'

interface IDBMeta {
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
  'sro_dbMeta',
  'sro_dbMeta',
  IDBMeta,
  IDBMeta
> {
  constructor(database: SroDatabase) {
    super(database, 'sro_dbMeta', dbMetaInit, 'sro_dbMeta')
  }
  override validate(obj: any): IDBMeta | undefined {
    if (typeof obj !== 'object') return undefined
    let { name, lastEdit, gender } = obj
    if (typeof name !== 'string')
      name = `Database ${this.database.storage.getDBIndex()}`
    if (typeof lastEdit !== 'number') console.warn('lastEdit INVALID')
    if (typeof lastEdit !== 'number') lastEdit = 0
    if (!allGenderKeys.includes(gender)) gender = 'F'

    return { name, lastEdit, gender } as IDBMeta
  }
  override importSROD(
    sroDb: ISroDatabase & ISrObjectDescription,
    _result: ImportResult
  ): void {
    const data = sroDb[this.goKey]
    if (data) {
      // Don't copy over lastEdit data
      const { lastEdit, ...rest } = data as IDBMeta
      this.set(rest)
    }
  }
}

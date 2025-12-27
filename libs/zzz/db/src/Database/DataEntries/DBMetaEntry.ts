import type { Database } from '@genshin-optimizer/common/database'
import { validateValue } from '@genshin-optimizer/common/util'
import {
  type CharacterKey,
  allCharacterKeys,
} from '@genshin-optimizer/zzz/consts'
import type { IZZZDatabase, IZenlessObjectDescription } from '../../Interfaces'
import { DataEntry } from '../DataEntry'
import type { ZzzDatabase } from '../Database'
import type { ImportResult } from '../exim'

interface IDBMeta {
  name: string
  lastEdit: number
  optCharKey?: CharacterKey
}

function dbMetaInit(database: Database): IDBMeta {
  return {
    name: `Database ${database.storage.getDBIndex()}`,
    lastEdit: 0,
  }
}

export class DBMetaEntry extends DataEntry<
  'dbMeta',
  'dbMeta',
  IDBMeta,
  IDBMeta
> {
  constructor(database: ZzzDatabase) {
    super(database, 'dbMeta', dbMetaInit, 'dbMeta')
  }
  override validate(obj: any): IDBMeta | undefined {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined
    let { name, lastEdit, optCharKey } = obj
    if (typeof name !== 'string')
      name = `Database ${this.database.storage.getDBIndex()}`
    if (typeof lastEdit !== 'number') console.warn('lastEdit INVALID')
    if (typeof lastEdit !== 'number') lastEdit = 0
    optCharKey = validateValue(optCharKey, allCharacterKeys)
    return { name, lastEdit, optCharKey } as IDBMeta
  }
  override importZOD(
    zoDb: IZZZDatabase & IZenlessObjectDescription,
    _result: ImportResult
  ): void {
    const data = zoDb[this.dataKey]
    if (data) {
      // Don't copy over lastEdit data
      const { lastEdit, ...rest } = data as IDBMeta
      this.set(rest)
    }
  }
}

import type { Database } from '@genshin-optimizer/common/database'
import type { GenderKey } from '@genshin-optimizer/sr/consts'
import { allGenderKeys } from '@genshin-optimizer/sr/consts'
import type { ISrObjectDescription } from '@genshin-optimizer/sr/srod'
import { z } from 'zod'
import type { ISroDatabase } from '../../Interfaces'
import { DataEntry } from '../DataEntry'
import type { SroDatabase } from '../Database'
import type { ImportResult } from '../exim'

// Schema with defaults - single source of truth
// Uses .catch() to provide fallback values for invalid data
const createDbMetaSchema = (defaultName: string) =>
  z.object({
    name: z.string().catch(defaultName),
    lastEdit: z.number().catch(0),
    gender: z
      .enum(allGenderKeys as unknown as [GenderKey, ...GenderKey[]])
      .catch('F'),
  })

// Type derived from schema
export type IDBMeta = z.infer<ReturnType<typeof createDbMetaSchema>>

export class DBMetaEntry extends DataEntry<
  'dbMeta',
  'dbMeta',
  IDBMeta,
  IDBMeta
> {
  constructor(database: SroDatabase) {
    const defaultName = (db: Database) => `Database ${db.storage.getDBIndex()}`
    super(
      database,
      'dbMeta',
      (db) => createDbMetaSchema(defaultName(db)).parse({}),
      'dbMeta'
    )
  }
  override validate(obj: unknown): IDBMeta | undefined {
    const defaultName = `Database ${this.database.storage.getDBIndex()}`
    const result = createDbMetaSchema(defaultName).safeParse(obj)
    return result.success ? result.data : undefined
  }
  override importSROD(
    sroDb: ISroDatabase & ISrObjectDescription,
    _result: ImportResult
  ): void {
    const data = sroDb[this.dataKey]
    if (data) {
      // Don't copy over lastEdit data
      const { lastEdit, ...rest } = data as IDBMeta
      this.set(rest)
    }
  }
}

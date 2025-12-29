import type { Database } from '@genshin-optimizer/common/database'
import {
  type CharacterKey,
  allCharacterKeys,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'
import type { IZZZDatabase, IZenlessObjectDescription } from '../../Interfaces'
import { DataEntry } from '../DataEntry'
import type { ZzzDatabase } from '../Database'
import type { ImportResult } from '../exim'

// Schema with defaults - single source of truth
// Uses .catch() to provide fallback values for invalid data
const createDbMetaSchema = (defaultName: string) =>
  z.object({
    name: z.string().catch(defaultName),
    lastEdit: z.number().catch(0),
    optCharKey: z
      .enum(allCharacterKeys as unknown as [CharacterKey, ...CharacterKey[]])
      .optional()
      .catch(undefined),
  })

// Type derived from schema
export type IDBMeta = z.infer<ReturnType<typeof createDbMetaSchema>>

export class DBMetaEntry extends DataEntry<
  'dbMeta',
  'dbMeta',
  IDBMeta,
  IDBMeta
> {
  constructor(database: ZzzDatabase) {
    const defaultName = (db: Database) => `Database ${db.storage.getDBIndex()}`
    super(
      database,
      'dbMeta',
      (db) => createDbMetaSchema(defaultName(db)).parse({}),
      'dbMeta'
    )
  }
  override validate(obj: unknown): IDBMeta | undefined {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

    const defaultName = `Database ${this.database.storage.getDBIndex()}`
    const result = createDbMetaSchema(defaultName).safeParse(obj)
    return result.success ? result.data : undefined
  }
  override importZOOD(
    zoodDb: IZZZDatabase & IZenlessObjectDescription,
    _result: ImportResult
  ): void {
    const data = zoodDb[this.dataKey]
    if (data) {
      // Don't copy over lastEdit data
      const { lastEdit, ...rest } = data as IDBMeta
      this.set(rest)
    }
  }
}

import { DataManagerBase } from '@genshin-optimizer/common/database'
import type { IZenlessObjectDescription, IZZZDatabase, ZzzDatabase } from '..'
import type { ImportResult } from './exim'
export class DataManager<
  CacheKey extends string,
  DataKey extends string,
  CacheValue extends StorageValue,
  StorageValue
> extends DataManagerBase<
  CacheKey,
  DataKey,
  CacheValue,
  StorageValue,
  ZzzDatabase
> {
  constructor(database: ZzzDatabase, dataKey: DataKey) {
    super(database, dataKey)
    // If the storage has a key for some entry AND
    // the entry doesn't exist in memory:
    // Delete it from storage
    for (const key of this.database.storage.keys)
      if (
        key.startsWith(`${this.goKeySingle}_`) &&
        !this.set(this.toCacheKey(key), {})
      ) {
        this.database.storage.remove(key)
      }
  }
  exportZOD(zo: Partial<IZenlessObjectDescription & IZZZDatabase>) {
    const key = this.dataKey
    zo[key] = Object.entries(this.data).map(([id, value]) => ({
      ...this.deCache(value),
      id,
    }))
  }
  importZOD(
    zo: IZenlessObjectDescription & IZZZDatabase,
    _result: ImportResult
  ) {
    const entries = zo[this.dataKey]
    if (entries && Array.isArray(entries))
      entries.forEach((ele) => ele.id && this.set(ele.id, ele))
  }
  override get goKeySingle() {
    const key = this.dataKey
    if (key.endsWith('s'))
      return `${this.database.keyPrefix}_${key.slice(0, -1)}`
    return `${this.database.keyPrefix}_${key}`
  }
}

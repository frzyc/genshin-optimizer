import { DataManagerBase } from '@genshin-optimizer/common/database'
import type { ISrObjectDescription } from '@genshin-optimizer/sr/srod'
import type { ISroDatabase, SroDatabase } from '..'
import type { ImportResult } from './exim'
export class DataManager<
  CacheKey extends string,
  DataKey extends string,
  CacheValue extends StorageValue,
  StorageValue,
> extends DataManagerBase<
  CacheKey,
  DataKey,
  CacheValue,
  StorageValue,
  SroDatabase
> {
  constructor(database: SroDatabase, dataKey: DataKey) {
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
  exportSROD(sro: Partial<ISrObjectDescription & ISroDatabase>) {
    const key = this.dataKey
    sro[key] = Object.entries(this.data).map(([id, value]) => ({
      ...this.deCache(value),
      id,
    }))
  }
  importSROD(sro: ISrObjectDescription & ISroDatabase, _result: ImportResult) {
    const entries = sro[this.dataKey]
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

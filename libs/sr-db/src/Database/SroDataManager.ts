import { DataManagerBase } from '@genshin-optimizer/database'
import type { ISrObjectDescription } from '@genshin-optimizer/sr-srod'
import type { ISroDatabase, SroDatabase } from '..'
import type { ImportResult } from './exim'
export class SroDataManager<
  CacheKey extends string,
  DataKey extends string,
  CacheValue extends StorageValue,
  StorageValue
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
        key.startsWith(this.goKeySingle) &&
        !this.set(this.toCacheKey(key), {})
      ) {
        this.database.storage.remove(key)
      }
  }
  exportSROD(sro: Partial<ISrObjectDescription & ISroDatabase>) {
    const key = this.dataKey.replace('sro_', '')
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
    const key = this.dataKey.replace('sro_', '')
    if (key.endsWith('s')) return key.slice(0, -1)
    return key
  }
  override toStorageKey(key: string): string {
    return `${this.goKeySingle}_${key}`
  }
  override toCacheKey(key: string): CacheKey {
    return key.split(`${this.goKeySingle}_`)[1] as CacheKey
  }
  override generateKey(keys: Set<string> = new Set(this.keys)): string {
    let ind = keys.size
    let candidate = ''
    do {
      candidate = `${ind++}`
    } while (keys.has(this.toStorageKey(candidate)))
    return candidate
  }
}

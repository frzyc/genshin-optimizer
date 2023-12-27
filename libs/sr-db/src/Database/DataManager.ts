import type { Database } from '@genshin-optimizer/database'
import { DataManagerBase } from '@genshin-optimizer/database'
import type { ISrObjectDescription } from '@genshin-optimizer/sr-srod'
import type { ISroDatabase } from '../'
import type { ImportResult } from './exim'
export class DataManager<
  CacheKey extends string,
  DataKey extends string,
  CacheValue extends StorageValue,
  StorageValue,
  DatabaseType extends Database
> extends DataManagerBase<
  CacheKey,
  DataKey,
  CacheValue,
  StorageValue,
  DatabaseType
> {
  exportSROD(sro: Partial<ISrObjectDescription & ISroDatabase>) {
    const key = this.dataKey.replace('sro_', '')
    sro[key] = (Object.entries(this.data) as [CacheKey, CacheValue][]).map(
      ([id, value]) => ({
        ...this.deCache(value),
        id,
      })
    )
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
}

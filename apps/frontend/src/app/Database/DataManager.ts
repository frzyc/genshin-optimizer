import type { Database } from '@genshin-optimizer/database'
import { DataManagerBase } from '@genshin-optimizer/database'
import type { IGOOD } from '@genshin-optimizer/gi-good'
import type { IGO, ImportResult } from './exim'
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
  exportGOOD(go: Partial<IGOOD & IGO>) {
    go[this.dataKey] = Object.entries(this.data).map(([id, value]) => ({
      ...this.deCache(value),
      id,
    }))
  }
  importGOOD(go: IGOOD & IGO, _result: ImportResult) {
    const entries = go[this.dataKey]
    if (entries && Array.isArray(entries))
      entries.forEach((ele) => ele.id && this.set(ele.id, ele))
  }
}

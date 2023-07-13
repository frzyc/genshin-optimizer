import { DataEntryBase } from '@genshin-optimizer/database'
import type { IGOOD } from '@genshin-optimizer/gi-good'
import type { IGO, ImportResult } from './exim'

export class DataEntry<
  Key extends string,
  GOkey extends string,
  CacheValue,
  StorageValue
> extends DataEntryBase<Key, GOkey, CacheValue, StorageValue> {
  exportGOOD(go: Partial<IGO & IGOOD>) {
    go[this.goKey] = this.data
  }
  importGOOD(
    go: IGO & IGOOD & { [k in GOkey]?: Partial<StorageValue> | never },
    _result: ImportResult
  ) {
    const data = go[this.goKey]
    if (data) this.set(data)
  }
}

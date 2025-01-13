import { DataEntryBase } from '@genshin-optimizer/common/database'
import type { IZenlessObjectDescription, IZZZDatabase } from '../Interfaces'
import type { ZzzDatabase } from './Database'
import type { ImportResult } from './exim'

export class DataEntry<
  Key extends string,
  SROKey extends string,
  CacheValue,
  StorageValue
> extends DataEntryBase<Key, SROKey, CacheValue, StorageValue, ZzzDatabase> {
  get prefixedKey() {
    return `${this.database.keyPrefix}_${this.goKey}`
  }
  exportZOD(zoDb: Partial<IZZZDatabase & IZenlessObjectDescription>) {
    zoDb[this.prefixedKey] = this.data
  }
  importZOD(
    zoDb: IZenlessObjectDescription &
      IZZZDatabase & { [k in SROKey]?: Partial<StorageValue> | never },
    _result: ImportResult
  ) {
    const data = zoDb[this.prefixedKey]
    if (data) this.set(data)
  }
}

import { DataEntryBase } from '@genshin-optimizer/common/database'
import type { IZZZDatabase, IZenlessObjectDescription } from '../Interfaces'
import type { ZzzDatabase } from './Database'
import type { ImportResult } from './exim'

export class DataEntry<
  Key extends string,
  ZOKey extends string,
  CacheValue,
  StorageValue,
> extends DataEntryBase<Key, ZOKey, CacheValue, StorageValue, ZzzDatabase> {
  exportZOD(zoDb: Partial<IZZZDatabase & IZenlessObjectDescription>) {
    zoDb[this.dataKey] = this.data
  }
  importZOD(
    zoDb: IZenlessObjectDescription &
      IZZZDatabase & { [k in ZOKey]?: Partial<StorageValue> | never },
    _result: ImportResult
  ) {
    const data = zoDb[this.dataKey]
    if (data) this.set(data)
  }
  override toStorageKey(): string {
    return `${this.database.keyPrefix}_${this.key}`
  }
}

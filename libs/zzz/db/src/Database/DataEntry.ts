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
  exportZOOD(zoodDb: Partial<IZZZDatabase & IZenlessObjectDescription>) {
    zoodDb[this.dataKey] = this.data
  }
  importZOOD(
    zoodDb: IZenlessObjectDescription &
      IZZZDatabase & { [k in ZOKey]?: Partial<StorageValue> | never },
    _result: ImportResult
  ) {
    const data = zoodDb[this.dataKey]
    if (data) this.set(data)
  }
  override toStorageKey(): string {
    return `${this.database.keyPrefix}_${this.key}`
  }
}

import { DataEntryBase } from '@genshin-optimizer/database'
import type { ISrObjectDescription } from '@genshin-optimizer/sr-srod'
import type { ISroDatabase } from '../Interfaces'
import type { ImportResult } from './exim'

export class DataEntry<
  Key extends string,
  SROKey extends string,
  CacheValue,
  StorageValue
> extends DataEntryBase<Key, SROKey, CacheValue, StorageValue> {
  exportSROD(sroDb: Partial<ISroDatabase & ISrObjectDescription>) {
    sroDb[this.goKey] = this.data
  }
  importSROD(
    sroDb: ISrObjectDescription &
      ISroDatabase & { [k in SROKey]?: Partial<StorageValue> | never },
    _result: ImportResult
  ) {
    const data = sroDb[this.goKey]
    if (data) this.set(data)
  }
}

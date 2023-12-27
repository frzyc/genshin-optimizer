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
    const key = this.goKey.replace('sro_', '')
    sroDb[key] = this.data
  }
  importSROD(
    sroDb: ISrObjectDescription &
      ISroDatabase & { [k in SROKey]?: Partial<StorageValue> | never },
    _result: ImportResult
  ) {
    const key = this.goKey.replace('sro_', '')
    const data = sroDb[key]
    if (data) this.set(data)
  }
}

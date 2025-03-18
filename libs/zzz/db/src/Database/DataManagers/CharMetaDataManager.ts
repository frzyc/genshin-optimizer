import { deepFreeze } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { ICharMeta } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { ZzzDatabase } from '../Database'

const initCharMeta: ICharMeta = deepFreeze({
  description: '',
})
export class CharMetaDataManager extends DataManager<
  CharacterKey,
  'charMetas',
  ICharMeta,
  ICharMeta
> {
  constructor(database: ZzzDatabase) {
    super(database, 'charMetas')
  }
  override validate(obj: any): ICharMeta | undefined {
    if (typeof obj !== 'object') return undefined

    let { description } = obj

    if (typeof description !== 'string') description = ''
    return { description }
  }

  override toStorageKey(key: string): string {
    return `${this.goKeySingle}_${key}`
  }
  override toCacheKey(key: string): CharacterKey {
    return key.split(`${this.goKeySingle}_`)[1] as CharacterKey
  }

  override get(key: CharacterKey): ICharMeta {
    return this.data[key] ?? initCharMeta
  }
}

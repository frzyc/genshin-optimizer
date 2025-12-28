import { zodString } from '@genshin-optimizer/common/database'
import { deepFreeze } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'
import type { ICharMeta } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { ZzzDatabase } from '../Database'

const initCharMeta: ICharMeta = deepFreeze({
  description: '',
})

const charMetaSchema = z.object({
  description: zodString(''),
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
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj))
      return undefined

    const result = charMetaSchema.safeParse(obj)
    if (!result.success) return undefined

    return result.data
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

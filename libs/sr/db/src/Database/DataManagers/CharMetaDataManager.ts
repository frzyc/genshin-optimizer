import { deepFreeze } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { allTrailblazerKeys } from '@genshin-optimizer/sr/consts'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

interface ICharMeta {
  favorite: boolean
}
const initCharMeta: ICharMeta = deepFreeze({
  favorite: false,
})

export class CharMetaDataManager extends DataManager<
  CharacterKey,
  'charMetas',
  ICharMeta,
  ICharMeta
> {
  constructor(database: SroDatabase) {
    super(database, 'charMetas')
  }
  override validate(obj: any): ICharMeta | undefined {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

    let { favorite } = obj
    if (typeof favorite !== 'boolean') favorite = false
    return { favorite }
  }
  getTrailblazerCharacterKey(): CharacterKey {
    return (
      allTrailblazerKeys.find((k) => this.keys.includes(k)) ??
      allTrailblazerKeys[0]
    )
  }
  override get(key: CharacterKey): ICharMeta {
    return this.data[key] ?? initCharMeta
  }
}

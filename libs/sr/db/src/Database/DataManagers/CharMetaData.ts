import { deepFreeze } from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  CharacterLocationKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import {
  allRelicSubStatKeys,
  allTrailblazerKeys,
} from '@genshin-optimizer/sr/consts'
import type { SroDatabase } from '../Database'
import { SroDataManager } from '../SroDataManager'

interface ICharMeta {
  rvFilter: RelicSubStatKey[]
  favorite: boolean
}
const initCharMeta: ICharMeta = deepFreeze({
  rvFilter: [...allRelicSubStatKeys],
  favorite: false,
})

export class CharMetaDataManager extends SroDataManager<
  CharacterKey,
  'charMetas',
  ICharMeta,
  ICharMeta
> {
  constructor(database: SroDatabase) {
    super(database, 'charMetas')
  }
  override validate(obj: any): ICharMeta | undefined {
    if (typeof obj !== 'object') return undefined

    let { rvFilter, favorite } = obj
    if (!Array.isArray(rvFilter)) rvFilter = []
    else rvFilter = rvFilter.filter((k) => allRelicSubStatKeys.includes(k))
    if (typeof favorite !== 'boolean') favorite = false
    return { rvFilter, favorite }
  }
  getTrailblazerCharacterKey(): CharacterKey {
    return (
      allTrailblazerKeys.find((k) => this.keys.includes(k)) ??
      allTrailblazerKeys[0]
    )
  }
  LocationToCharacterKey(key: CharacterLocationKey): CharacterKey {
    return key === 'Trailblazer' ? this.getTrailblazerCharacterKey() : key
  }
  override get(key: CharacterKey): ICharMeta {
    return this.data[key] ?? initCharMeta
  }
}

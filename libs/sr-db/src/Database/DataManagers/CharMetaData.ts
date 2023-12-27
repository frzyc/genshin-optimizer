import type {
  CharacterKey,
  CharacterLocationKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr-consts'
import {
  allRelicSubStatKeys,
  allTrailblazerKeys,
} from '@genshin-optimizer/sr-consts'
import { deepFreeze } from '@genshin-optimizer/util'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

interface ICharMeta {
  rvFilter: RelicSubStatKey[]
  favorite: boolean
}
const initCharMeta: ICharMeta = deepFreeze({
  rvFilter: [...allRelicSubStatKeys],
  favorite: false,
})
const storageHash = 'charMeta_'
const storageKey = 'sro_charMetas_'
export class CharMetaDataManager extends DataManager<
  CharacterKey,
  typeof storageKey,
  ICharMeta,
  ICharMeta,
  SroDatabase
> {
  constructor(database: SroDatabase) {
    super(database, storageKey)
    for (const key of this.database.storage.keys)
      if (
        key.startsWith(storageHash) &&
        !this.set(key.split(storageHash)[1] as CharacterKey, {})
      )
        this.database.storage.remove(key)
  }
  override validate(obj: any): ICharMeta | undefined {
    if (typeof obj !== 'object') return undefined

    let { rvFilter, favorite } = obj
    if (!Array.isArray(rvFilter)) rvFilter = []
    else rvFilter = rvFilter.filter((k) => allRelicSubStatKeys.includes(k))
    if (typeof favorite !== 'boolean') favorite = false
    return { rvFilter, favorite }
  }

  override toStorageKey(key: CharacterKey): string {
    return `${storageHash}${key}`
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

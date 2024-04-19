import { deepFreeze } from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'
import { allTravelerKeys } from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'

export interface ICharMeta {
  favorite: boolean
}
const initCharMeta: ICharMeta = deepFreeze({
  favorite: false,
})
const storageHash = 'charMeta_'
export class CharMetaDataManager extends DataManager<
  CharacterKey,
  'charMetas',
  ICharMeta,
  ICharMeta,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'charMetas')
    for (const key of this.database.storage.keys)
      if (
        key.startsWith(storageHash) &&
        !this.set(key.split(storageHash)[1] as CharacterKey, {})
      )
        this.database.storage.remove(key)
  }
  override validate(obj: any): ICharMeta | undefined {
    if (typeof obj !== 'object') return undefined

    let { favorite } = obj

    if (typeof favorite !== 'boolean') favorite = false
    return { favorite }
  }

  override toStorageKey(key: CharacterKey): string {
    return `${storageHash}${key}`
  }
  getTravelerCharacterKey(): CharacterKey {
    return (
      allTravelerKeys.find((k) => this.keys.includes(k)) ?? allTravelerKeys[0]
    )
  }
  LocationToCharacterKey(key: LocationCharacterKey): CharacterKey {
    return key === 'Traveler' ? this.getTravelerCharacterKey() : key
  }
  override get(key: CharacterKey): ICharMeta {
    return this.data[key] ?? initCharMeta
  }
}

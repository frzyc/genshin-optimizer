import type {
  CharacterKey,
  LocationCharacterKey,
  SubstatKey,
} from '@genshin-optimizer/consts'
import { allSubstatKeys, allTravelerKeys } from '@genshin-optimizer/consts'
import { deepFreeze } from '@genshin-optimizer/util'
import type { ArtCharDatabase } from '../Database'
import { DataManager } from '../DataManager'

export interface ICharMeta {
  rvFilter: SubstatKey[]
  favorite: boolean
}
const initCharMeta: ICharMeta = deepFreeze({
  rvFilter: [...allSubstatKeys],
  favorite: false,
})
const storageHash = 'charMeta_'
export class CharMetaDataManager extends DataManager<
  CharacterKey,
  'charMetas',
  ICharMeta,
  ICharMeta
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

    let { rvFilter, favorite } = obj
    if (!Array.isArray(rvFilter)) rvFilter = []
    else rvFilter = rvFilter.filter((k) => allSubstatKeys.includes(k))
    if (typeof favorite !== 'boolean') favorite = false
    return { rvFilter, favorite }
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

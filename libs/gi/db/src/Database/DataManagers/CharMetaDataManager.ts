import { deepFreeze } from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'
import { allTravelerKeys } from '@genshin-optimizer/gi/consts'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'

// Schema with defaults - single source of truth
const charMetaSchema = z.object({
  favorite: z.boolean().catch(false),
  description: z.string().catch(''),
  rvFilter: z.array(z.unknown()).catch([]),
})

// Type derived from schema
export type ICharMeta = z.infer<typeof charMetaSchema>

const initCharMeta: ICharMeta = deepFreeze(charMetaSchema.parse({}))

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
  override validate(obj: unknown): ICharMeta | undefined {
    const result = charMetaSchema.safeParse(obj)
    return result.success ? result.data : undefined
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

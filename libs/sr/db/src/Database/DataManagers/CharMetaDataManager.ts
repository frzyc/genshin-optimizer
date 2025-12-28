import { zodBoolean } from '@genshin-optimizer/common/database'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { allTrailblazerKeys } from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

// Schema with defaults - single source of truth
const charMetaSchema = z.object({
  favorite: zodBoolean(),
})

// Type derived from schema
export type ICharMeta = z.infer<typeof charMetaSchema>

// Initial state uses schema as source of truth
const initCharMeta: ICharMeta = charMetaSchema.parse({})

export class CharMetaDataManager extends DataManager<
  CharacterKey,
  'charMetas',
  ICharMeta,
  ICharMeta
> {
  constructor(database: SroDatabase) {
    super(database, 'charMetas')
  }
  override validate(obj: unknown): ICharMeta | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    const result = charMetaSchema.safeParse(obj)
    return result.success ? result.data : undefined
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

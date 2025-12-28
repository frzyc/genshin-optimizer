import {
  zodBoolean,
  zodEnumWithDefault,
  zodFilteredArray,
  zodString,
} from '@genshin-optimizer/common/database'
import type {
  LocationKey,
  SpecialityKey,
  WengineRarityKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allLocationKeys,
  allSpecialityKeys,
  allWengineRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'
import { DataEntry } from '../DataEntry'
import type { ZzzDatabase } from '../Database'

export const wengineSortKeys = ['level', 'rarity', 'name'] as const
export type WengineSortKey = (typeof wengineSortKeys)[number]

export interface IDisplayWengine {
  editWengineId: string
  sortType: WengineSortKey
  ascending: boolean
  rarity: WengineRarityKey[]
  speciality: SpecialityKey[]
  locked: Array<'locked' | 'unlocked'>
  showInventory: boolean
  showEquipped: boolean
  locations: LocationKey[]
}

// Schema with defaults - single source of truth
const displayWengineSchemaInternal = z.object({
  editWengineId: zodString(''),
  sortType: zodEnumWithDefault(wengineSortKeys, 'level'),
  ascending: zodBoolean(),
  rarity: zodFilteredArray(allWengineRarityKeys),
  speciality: zodFilteredArray(allSpecialityKeys),
  locked: zodFilteredArray(['locked', 'unlocked'] as const),
  showEquipped: zodBoolean({ defaultValue: true }),
  showInventory: zodBoolean({ defaultValue: true }),
  locations: zodFilteredArray(allLocationKeys, []),
})

// Typed version for external use
const displayWengineSchema =
  displayWengineSchemaInternal as z.ZodType<IDisplayWengine>

// Reset schema type (excludes sortType and ascending - those are preserved on reset)
type ResetOptions = Omit<IDisplayWengine, 'sortType' | 'ascending'>

// Reset schema (excludes sortType and ascending - those are preserved on reset)
const resetSchema = displayWengineSchemaInternal.omit({
  sortType: true,
  ascending: true,
}) as z.ZodType<ResetOptions>

export class DisplayWengineEntry extends DataEntry<
  'display_wengine',
  'display_wengine',
  IDisplayWengine,
  IDisplayWengine
> {
  constructor(database: ZzzDatabase) {
    super(
      database,
      'display_wengine',
      () => displayWengineSchema.parse({}),
      'display_wengine'
    )
  }
  override validate(obj: unknown): IDisplayWengine | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    const result = displayWengineSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
  override set(
    value:
      | Partial<IDisplayWengine>
      | ((v: IDisplayWengine) => Partial<IDisplayWengine> | void)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset') return super.set(resetSchema.parse({}))
      return false
    } else return super.set(value)
  }
}

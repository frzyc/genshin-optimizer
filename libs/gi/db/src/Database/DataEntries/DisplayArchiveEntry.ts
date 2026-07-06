import {
  zodEnumWithDefault,
  zodFilteredArray,
  zodObject,
} from '@genshin-optimizer/common/database'
import {
  allArtifactRarityKeys,
  allCharacterRarityKeys,
  allRarityKeys,
  allWeaponSubstatKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

const sortOrderKeys = ['asc', 'desc'] as const
const characterSortByKeys = ['name', 'rarity', 'element', 'type'] as const
const weaponSortByKeys = [
  'name',
  'type',
  'rarity',
  'main',
  'sub',
  'subType',
] as const

const artifactOptionSchema = z.object({
  rarity: zodFilteredArray(allArtifactRarityKeys),
})

const characterOptionSchema = z.object({
  rarity: zodFilteredArray(allCharacterRarityKeys),
  weaponType: zodFilteredArray(allWeaponTypeKeys),
  sortOrder: zodEnumWithDefault(sortOrderKeys, 'desc'),
  sortOrderBy: zodEnumWithDefault(characterSortByKeys, 'name'),
})

const weaponOptionSchema = z.object({
  rarity: zodFilteredArray(allRarityKeys),
  weaponType: zodFilteredArray(allWeaponTypeKeys),
  subStat: zodFilteredArray(allWeaponSubstatKeys, []),
  sortOrder: zodEnumWithDefault(sortOrderKeys, 'desc'),
  sortOrderBy: zodEnumWithDefault(weaponSortByKeys, 'name'),
})

const displayArchiveSchema = z.object({
  artifact: zodObject(artifactOptionSchema.shape),
  character: zodObject(characterOptionSchema.shape),
  weapon: zodObject(weaponOptionSchema.shape),
})

export type ArchiveArtifactOption = z.infer<typeof artifactOptionSchema>
export type ArchiveCharacterOption = z.infer<typeof characterOptionSchema>
export type ArchiveWeaponOption = z.infer<typeof weaponOptionSchema>
export type IDisplayArchiveEntry = z.infer<typeof displayArchiveSchema>

function initialState(): IDisplayArchiveEntry {
  return displayArchiveSchema.parse({})
}

export class DisplayArchiveEntry extends DataEntry<
  'display_archive',
  'display_archive',
  IDisplayArchiveEntry,
  IDisplayArchiveEntry
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_archive', initialState, 'display_archive')
  }
  override validate(obj: unknown): IDisplayArchiveEntry | undefined {
    const result = displayArchiveSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
}

import { validateArr } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  CharacterRarityKey,
  RarityKey,
  WeaponSubstatKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allCharacterRarityKeys,
  allRarityKeys,
  allWeaponSubstatKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export interface ArchiveArtifactOption {
  rarity: ArtifactRarity[]
}

export interface ArchiveCharacterOption {
  rarity: CharacterRarityKey[]
  weaponType: WeaponTypeKey[]
  sortOrder: 'asc' | 'desc'
  sortOrderBy: 'name' | 'rarity' | 'element' | 'type'
}

export interface ArchiveWeaponOption {
  rarity: RarityKey[]
  weaponType: WeaponTypeKey[]
  subStat: WeaponSubstatKey[]
  sortOrder: 'asc' | 'desc'
  sortOrderBy: 'name' | 'type' | 'rarity' | 'main' | 'sub' | 'subType'
}

export interface IDisplayArchiveEntry {
  artifact: ArchiveArtifactOption
  character: ArchiveCharacterOption
  weapon: ArchiveWeaponOption
}

const initialArtifactOption = (): ArchiveArtifactOption => ({
  rarity: [...allArtifactRarityKeys],
})

const initialCharacterOption = (): ArchiveCharacterOption => ({
  rarity: [...allCharacterRarityKeys],
  weaponType: [...allWeaponTypeKeys],
  sortOrder: 'desc',
  sortOrderBy: 'name',
})

const initialWeaponOption = (): ArchiveWeaponOption => ({
  rarity: [...allRarityKeys],
  weaponType: [...allWeaponTypeKeys],
  subStat: [],
  sortOrder: 'desc',
  sortOrderBy: 'name',
})

const initialState = (): IDisplayArchiveEntry => ({
  artifact: initialArtifactOption(),
  character: initialCharacterOption(),
  weapon: initialWeaponOption(),
})

export class DisplayArchiveEntry extends DataEntry<
  'display_archive',
  'display_archive',
  IDisplayArchiveEntry,
  IDisplayArchiveEntry
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_archive', initialState, 'display_archive')
  }
  override validate(obj: any): IDisplayArchiveEntry | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    let { artifact, character, weapon } = obj

    if (typeof artifact !== 'object') artifact = initialArtifactOption()
    else {
      let { rarity } = artifact
      rarity = validateArr(rarity, allArtifactRarityKeys)

      artifact = {
        rarity,
      }

      if (typeof character !== 'object') character = initialCharacterOption()
      else {
        let { rarity, weaponType, sortOrder, sortOrderBy } = character
        rarity = validateArr(rarity, allCharacterRarityKeys)
        weaponType = validateArr(weaponType, allWeaponTypeKeys)
        if (!['asc', 'desc'].includes(sortOrder)) {
          sortOrder = 'desc'
        }
        if (!['name', 'rarity', 'element', 'type'].includes(sortOrderBy)) {
          sortOrderBy = 'name'
        }
        character = {
          rarity,
          weaponType,
          sortOrder,
          sortOrderBy,
        }
      }

      if (typeof weapon !== 'object') weapon = initialWeaponOption()
      else {
        let { rarity, subStat, weaponType, sortOrder, sortOrderBy } = weapon
        rarity = validateArr(rarity, allRarityKeys)
        subStat = validateArr(subStat, allWeaponSubstatKeys, [])
        weaponType = validateArr(weaponType, allWeaponTypeKeys)
        if (!['asc', 'desc'].includes(sortOrder)) {
          sortOrder = 'desc'
        }
        if (!['name', 'type', 'rarity', 'main', 'sub'].includes(sortOrderBy)) {
          sortOrderBy = 'name'
        }

        weapon = {
          rarity,
          subStat,
          weaponType,
          sortOrder,
          sortOrderBy,
        }
      }
    }

    return {
      artifact,
      character,
      weapon,
    }
  }
}

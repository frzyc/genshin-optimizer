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
}

export interface ArchiveWeaponOption {
  rarity: RarityKey[]
  weaponType: WeaponTypeKey[]
  subStat: WeaponSubstatKey[]
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
})

const initialWeaponOption = (): ArchiveWeaponOption => ({
  rarity: [...allRarityKeys],
  weaponType: [...allWeaponTypeKeys],
  subStat: [],
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
    if (typeof obj !== 'object') return undefined
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
        let { rarity, weaponType } = character
        rarity = validateArr(rarity, allCharacterRarityKeys)
        weaponType = validateArr(weaponType, allWeaponTypeKeys)

        character = {
          rarity,
          weaponType,
        }
      }

      if (typeof weapon !== 'object') weapon = initialWeaponOption()
      else {
        let { rarity, subStat, weaponType } = weapon
        rarity = validateArr(rarity, allRarityKeys)
        subStat = validateArr(subStat, allWeaponSubstatKeys, [])
        weaponType = validateArr(weaponType, allWeaponTypeKeys)

        weapon = {
          rarity,
          subStat,
          weaponType,
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

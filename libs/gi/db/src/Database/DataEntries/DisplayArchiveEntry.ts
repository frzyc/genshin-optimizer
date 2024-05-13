import { validateArr } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  CharacterRarityKey,
  RarityKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allCharacterRarityKeys,
  allRarityKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export interface IArtifactOption {
  rarity: ArtifactRarity[]
}

export interface ICharacterOption {
  rarity: CharacterRarityKey[]
  weaponType: WeaponTypeKey[]
}

export interface IWeaponOption {
  rarity: RarityKey[]
  weaponType: WeaponTypeKey[]
}

export interface IDisplayArchiveEntry {
  artifact: IArtifactOption
  character: ICharacterOption
  weapon: IWeaponOption
}

const initialArtifactOption = (): IArtifactOption => ({
  rarity: [...allArtifactRarityKeys],
})

const initialCharacterOption = (): ICharacterOption => ({
  rarity: [...allCharacterRarityKeys],
  weaponType: [...allWeaponTypeKeys],
})

const initialWeaponOption = (): IWeaponOption => ({
  rarity: [...allRarityKeys],
  weaponType: [...allWeaponTypeKeys],
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
        let { rarity } = weapon
        rarity = validateArr(rarity, allRarityKeys)

        weapon = {
          rarity,
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

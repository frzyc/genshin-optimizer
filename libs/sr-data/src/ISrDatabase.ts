import type { ICharacter } from './ICharacter'
import type { ILightCone } from './ILightCone'
import type { IRelic } from './IRelic'

export type ISrDatabase = {
  format: string
  source: string
  version: 1
  characters?: ICharacter[]
  relics?: IRelic[]
  lightCones?: ILightCone[]
}

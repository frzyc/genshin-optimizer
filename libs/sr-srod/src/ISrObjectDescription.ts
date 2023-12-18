import type { ICharacter } from './ICharacter'
import type { ILightCone } from './ILightCone'
import type { IRelic } from './IRelic'

export type ISrObjectDescription = {
  format: string
  source: string
  version: 1
  characters?: ICharacter[]
  relics?: IRelic[]
  lightCones?: ILightCone[]
}

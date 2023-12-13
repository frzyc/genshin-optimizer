import type { ICharacter } from './ICharacter'
import type { ILightCone } from './ILightCone'
import type { IRelic } from './IRelic'

export type ISRODatabase = {
  format: 'SRO'
  source: string
  version: 1
  characters?: ICharacter[]
  relics?: IRelic[]
  lightcones?: ILightCone[]
}

import type { ICharacter } from './ICharacter'
import type { IArtifact } from './IArtifact'
import type { IWeapon } from './IWeapon'
export type IGOOD = {
  format: 'GOOD'
  source: string
  version: 1
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
}

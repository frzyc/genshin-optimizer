import type { IArtifact } from './IArtifact'
import type { ICharacter } from './ICharacter'
import type { IWeapon } from './IWeapon'
export type IGOOD = {
  format: 'GOOD'
  source: string
  version: 1 | 2 | 3
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
}

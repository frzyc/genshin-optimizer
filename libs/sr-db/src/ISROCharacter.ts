import type {
  RelicSlotKey,
  CharacterKey,
  HitModeKey,
} from '@genshin-optimizer/sr-consts'
import type { ICharacter } from '@genshin-optimizer/sr-data'

export interface ISROCharacter extends ICharacter {
  hitMode: HitModeKey
  // conditional: IConditionalValues
  // bonusStats: Partial<Record<InputPremodKey, number>>
  // enemyOverride: Partial<
  //   Record<
  //     EleEnemyResKey | 'enemyLevel' | 'enemyDefRed_' | 'enemyDefIgn_',
  //     number
  //   >
  // >
  compareData: boolean
  // customMultiTarget: CustomMultiTarget[]
  team: [
    teammate1: CharacterKey | '',
    teammate2: CharacterKey | '',
    teammate3: CharacterKey | ''
  ]
}

export interface ICachedSROCharacter extends ISROCharacter {
  equippedRelics: Record<RelicSlotKey, string>
  equippedWeapon: string
}

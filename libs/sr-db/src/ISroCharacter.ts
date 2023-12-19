import type {
  RelicSlotKey,
  CharacterKey,
  HitModeKey,
} from '@genshin-optimizer/sr-consts'
import type { ICharacter } from '@genshin-optimizer/sr-srod'

export interface ISroCharacter extends ICharacter {
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

export interface ICachedSroCharacter extends ISroCharacter {
  equippedRelics: Record<RelicSlotKey, string>
  equippedLightCone: string
}

import type {
  CharacterKey,
  HitModeKey,
  RelicSlotKey,
<<<<<<< HEAD:libs/sr-db/src/Interfaces/ISroCharacter.ts
} from '@genshin-optimizer/sr-consts'
import type { ICharacter } from '@genshin-optimizer/sr-srod'
=======
} from '@genshin-optimizer/sr/consts'
import type { ICharacter } from '@genshin-optimizer/sr/srod'
>>>>>>> origin/master:libs/sr/db/src/Interfaces/ISroCharacter.ts

export interface ISroCharacter extends ICharacter {
  hitMode: HitModeKey
  // TODO: Take typings from sr-formula
  // Record<Source, Record< string, string | number>>
  conditional: Record<string, Record<string, string | number>>
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
  equippedLightCone?: string
}

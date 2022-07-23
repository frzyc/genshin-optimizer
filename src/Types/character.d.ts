import { EleEnemyResKey, StatKey } from "../KeyMap";
import { CharacterKey, ElementKey, HitModeKey, InfusionAuraElements, ReactionModeKey, SlotKey } from "./consts";
import { IConditionalValues } from "./IConditional";
import { DocumentSection } from "./sheet";
export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: number
  talent: {
    auto: number
    skill: number
    burst: number
  }

  team: [teammate1: CharacterKey | "", teammate2: CharacterKey | "", teammate3: CharacterKey | ""]
  // GO-specific
  hitMode: HitModeKey
  elementKey?: ElementKey
  reactionMode: ReactionModeKey | ""
  conditional: IConditionalValues
  bonusStats: Partial<Record<StatKey, number>>
  enemyOverride: Partial<Record<EleEnemyResKey | "enemyLevel" | "enemyDefRed_" | "enemyDefIgn_", number>>
  infusionAura: InfusionAuraElements | ""
  compareData: boolean
}
export interface ICachedCharacter extends ICharacter {
  equippedArtifacts: StrictDict<SlotKey, string>
  equippedWeapon: string
}

import { EleEnemyResKey, StatKey } from "../KeyMap";
import { AdditiveReactionKey, AmpReactionKey, Ascension, CharacterKey, ElementKey, HitModeKey, InfusionAuraElements, SlotKey } from "./consts";
import { IConditionalValues } from "./IConditional";

export interface CustomTarget {
  weight: number,
  path: string[]
  hitMode: HitModeKey,
  reaction?: AmpReactionKey | AdditiveReactionKey,
  infusionAura?: InfusionAuraElements,
  bonusStats: Partial<Record<InputPremodKey, number>>
}
export interface CustomMultiTarget {
  name: string,
  targets: CustomTarget[]
}

export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: Ascension
  talent: {
    auto: number
    skill: number
    burst: number
  }

  team: [teammate1: CharacterKey | "", teammate2: CharacterKey | "", teammate3: CharacterKey | ""]
  teamConditional: Partial<Record<CharacterKey, IConditionalValues>>
  // GO-specific
  hitMode: HitModeKey
  elementKey?: ElementKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  conditional: IConditionalValues
  bonusStats: Partial<Record<StatKey, number>>
  enemyOverride: Partial<Record<EleEnemyResKey | "enemyLevel" | "enemyDefRed_" | "enemyDefIgn_", number>>
  infusionAura: InfusionAuraElements | ""
  compareData: boolean
  customMultiTarget: CustomMultiTarget[]
}
export interface ICachedCharacter extends ICharacter {
  equippedArtifacts: StrictDict<SlotKey, string>
  equippedWeapon: string
}

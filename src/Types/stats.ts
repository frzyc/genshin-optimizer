import { StatKey } from "./artifact";
import { ICachedCharacter } from "./character";
import { ArtifactSetKey, CharacterKey, ElementKey, HitModeKey, ReactionModeKey, SlotKey, WeaponTypeKey } from "./consts";
import { IConditionalValue, IConditionalValues } from "./IConditional";

type Flat = number
type Percent = number

/** Stats that are not affected by artifacts */
export interface BasicStats {
  characterKey: CharacterKey, weaponType: WeaponTypeKey
  hitMode: HitModeKey, reactionMode: ReactionModeKey | ""
  weapon: {
    key: string;
    refineIndex: number;
  }

  characterHP: Flat, characterDEF: Flat, characterATK: Flat
  characterEle: ElementKey, characterLevel: number
  infusionSelf?: ElementKey, infusionAura: ElementKey | ""
  enemyLevel: number, enemyDEFRed_: Percent
  weaponATK: Flat

  constellation: number;
  ascension: number;
  tlvl: {
    auto: number;
    skill: number;
    burst: number;
  }

  conditionalValues: IConditionalValues<IConditionalValue>
  team: ICachedCharacter["team"]
  teamElement: [teammate1: ElementKey | "", teammate2: ElementKey | "", teammate3: ElementKey | ""]
  teamStats: [teammate1: ICalculatedStats | null, teammate2: ICalculatedStats | null, teammate3: ICalculatedStats | null]
  mainStatAssumptionLevel: number
}

/**
 * Technically, `ICalculatedStats` still wouldn't have all fields from BonusStats.
 * Though, all required stats would already be included during dependency calculation
 * and preprocessing.
 */
export type ICalculatedStats = BasicStats & Required<BonusStats> & {
  premod: Partial<ICalculatedStats>
  modStats: Partial<ICalculatedStats>
  // Pass on stats to the party
  partyStats: Partial<ICalculatedStats>
  partyOnlyStats: Partial<ICalculatedStats>
  partyActiveStats: Partial<ICalculatedStats>
  equippedArtifacts?: StrictDict<SlotKey, string>
  setToSlots: Dict<ArtifactSetKey, SlotKey[]>
} & {
  [key: string]: any
}

/** Stats that can be increased from artifacts */
export type BonusStats = {
  [key in StatKey]?: number
} & {
  infusionSelf?: ElementKey
  infusionAura?: ElementKey
  modifiers?: Modifier
}

export interface Modifier {
  [key: string]: string[][]
}
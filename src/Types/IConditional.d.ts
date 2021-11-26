import { BonusStats, BasicStats } from "./stats";
import { IFieldDisplay } from "./IFieldDisplay";

export interface IConditionalBase {
  canShow?: (stats: BasicStats) => boolean;
  name: Displayable;
  header?: {
    title: Displayable;
    icon?: Displayable | ((stats: BasicStats) => Displayable);
    action?: Displayable;
  }
  description?: Displayable | ((stats: BasicStats) => Displayable);
  partyBuff?: "partyActive" | "partyAll" | "partyOnly"
  key: string,
  keys?: string[]
}
export interface IConditionalSimple extends IConditionalBase {
  stats?: BonusStats | ((stats: BasicStats) => BonusStats);
  fields?: IFieldDisplay[];
  maxStack?: number | ((stats: BasicStats) => number);
}
export interface IConditionalConstant extends IConditionalBase {
  stats?: BonusStats | ((stats: BasicStats) => BonusStats)
  fields?: IFieldDisplay[]
  name?: Displayable
  maxStack: 0
}

export interface IConditionalComplex extends IConditionalBase {
  states: {
    [key: string]: {
      name: Displayable;
      stats?: BonusStats | ((stats: BasicStats) => BonusStats);
      fields?: IFieldDisplay[];
      maxStack?: number | ((stats: BasicStats) => number);
    }
  }
}

type IConditional = IConditionalConstant | IConditionalComplex | IConditionalSimple;
export default IConditional

export type IConditionalValue = [conditionalNum: number, stateKey?: string]

export interface IConditionalValues<T> {
  resonance?: {
    [key in string]?: T
  }
  character?: {
    [key in Exclude<CharacterKey, "Traveler"> | "Travler_anemo" | "Traveler_geo" | "Traveler_electro"]?: {
      [key in string]?: T
    }
  },
  weapon?: {
    [key in WeaponKey]?: {
      [key in string]?: T
    }
  },
  artifact?: {
    [key in ArtifactSetKey]?: {
      [key in SetNum]?: {
        [key in string]: T
      }
    }
  },
}
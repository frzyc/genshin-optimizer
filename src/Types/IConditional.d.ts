import { BonusStats, BasicStats } from "./stats";
import { IFieldDisplay } from "./IFieldDisplay";

export interface IConditionalSimple {
  canShow?: (stats: BasicStats) => boolean;
  name: Displayable;
  stats?: BonusStats | ((stats: BasicStats) => BonusStats);
  fields?: Array<IFieldDisplay>;
  maxStack?: number | ((stats: BasicStats) => number);
  keys?: string[]
}

export interface IConditionalComplex {
  canShow?: (stats: BasicStats) => boolean;
  name: Displayable;
  states: {
    [key: string]: {
      name: Displayable;
      stats?: BonusStats | ((stats: BasicStats) => BonusStats);
      fields?: Array<IFieldDisplay>;
      maxStack?: number | ((stats: BasicStats) => number);
    }
  },
  keys?: string[]
}

type IConditional = IConditionalComplex | IConditionalSimple;
export default IConditional
export interface IConditionals {
  [key: string]: IConditional
}

export type IConditionalValue = [conditionalNum: number, stateKey?: string]
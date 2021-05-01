import ICalculatedStats from "./ICalculatedStats";
import { IFieldDisplay } from "./IFieldDisplay";

export interface IConditionalSimple {
  canShow?: (stats: ICalculatedStats) => boolean;
  name: Displayable;
  stats?: object | ((stats: ICalculatedStats) => object);
  fields?: Array<IFieldDisplay>;
  maxStack?: number | ((stats: ICalculatedStats) => number);
  keys?: string[]
}

export interface IConditionalComplex {
  canShow?: (stats: ICalculatedStats) => boolean;
  name: Displayable;
  states: {
    [key: string]: {
      name: Displayable;
      stats?: object | ((stats: ICalculatedStats) => object);
      fields?: Array<IFieldDisplay>;
      maxStack?: number | ((stats: ICalculatedStats) => number);
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
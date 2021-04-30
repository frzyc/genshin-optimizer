import ICalculatedStats from "./ICalculatedStats";
import { IFieldDisplay } from "./IFieldDisplay";

export default interface IConditional {
  canShow?: (stats: ICalculatedStats) => boolean;
  name: Displayable;
  stats?: object | ((stats: ICalculatedStats) => object);
  fields?: Array<IFieldDisplay>;
  maxStack?: number;
}
export interface IConditionalComplex {
  canShow?: (stats: ICalculatedStats) => boolean;
  name: Displayable;
  states: {
    [key: string]: {
      name: Displayable;
      stats?: object | ((stats: ICalculatedStats) => object);
      fields?: Array<IFieldDisplay>;
      maxStack?: number;
    }
  }
}
export interface IConditionals {
  [key: string]: IConditional | IConditionalComplex
}
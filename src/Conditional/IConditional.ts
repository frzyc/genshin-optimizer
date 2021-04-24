import ICalculatedStats from "../Build/ICalculatedStats";
import { IFieldDisplay } from "../Data/IFieldDisplay";

export default interface IConditional {
  canShow?: (stats: ICalculatedStats) => boolean;
  name: string | JSX.Element;
  stats?: object | ((stats: ICalculatedStats) => object);
  fields?: Array<IFieldDisplay>;
  maxStack?: number;
}
export interface IConditionalComplex {
  canShow?: (stats: ICalculatedStats) => boolean;
  name: string | JSX.Element;
  states: {
    [key: string]: {
      name: string | JSX.Element;
      stats?: object | ((stats: ICalculatedStats) => object);
      fields?: Array<IFieldDisplay>;
      maxStack?: number;
    }
  }
}
export interface IConditionals {
  [key: string]: IConditional | IConditionalComplex
}
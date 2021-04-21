import CalculatedStats from "../Build/CalculatedStatsInterface";
import { FieldDisplay } from "../Data/FieldDisplayInterface";

export default interface Conditional {
  canShow?: (stats: CalculatedStats) => boolean;
  name: string | JSX.Element;
  stats?: object | ((stats: CalculatedStats) => object);
  fields?: Array<FieldDisplay>;
  maxStack?: number;
}
export interface ConditionalComplex {
  canShow?: (stats: CalculatedStats) => boolean;
  name: string | JSX.Element;
  states: {
    [key: string]: {
      name: string | JSX.Element;
      stats?: object | ((stats: CalculatedStats) => object);
      fields?: Array<FieldDisplay>;
      maxStack?: number;
    }
  }
}
export interface Conditionals {
  [key: string]: Conditional | ConditionalComplex
}
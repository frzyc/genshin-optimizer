import { FieldDisplay } from "../Data/FieldDisplayInterface";

export default interface Conditional {
  canShow?: (any) => boolean;
  name: string | JSX.Element;
  stats?: object | ((stats: any) => object);
  fields?: Array<FieldDisplay>;
  maxStack?: number;
}
export interface ConditionalComplex {
  canShow?: (any) => boolean;
  name: string | JSX.Element;
  states: {
    [key: string]: {
      name: string | JSX.Element;
      stats?: object;
      fields?: Array<FieldDisplay>;
      maxStack?: number;
    }
  }
}
export interface Conditionals {
  [key: string]: Conditional | ConditionalComplex
}
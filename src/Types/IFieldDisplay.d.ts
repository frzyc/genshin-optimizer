import ICalculatedStats from "./ICalculatedStats";

export interface IFieldDisplay {
  canShow?: (stats: ICalculatedStats) => boolean;
  text: Displayable;
  value?: number | Displayable | ((stats: ICalculatedStats) => number | Displayable);
  fixed?: number;
  formula?: (stats: any) => Array<any>;
  formulaText?: JSX.Element | ((stats: ICalculatedStats) => JSX.Element)
  variant?: string | ((stats: ICalculatedStats) => string);
  unit?: Displayable
}
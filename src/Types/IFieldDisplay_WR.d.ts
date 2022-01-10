import { BasicStats, ICalculatedStats } from "./stats";

export interface IFieldDisplay {
  canShow?: (stats: BasicStats) => boolean;
  text: Displayable;
  value?: number | Displayable | ((stats: ICalculatedStats) => number | Displayable);
  fixed?: number;
  formula?: string[];
  // TODO: should be from WR
  variant?: string | ((stats: BasicStats) => string);
  unit?: Displayable
}
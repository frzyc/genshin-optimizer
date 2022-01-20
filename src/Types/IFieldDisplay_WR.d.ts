import { Node } from "../Formula/type";
import { BasicStats, ICalculatedStats } from "./stats";

export interface IBasicFieldDisplay {
  canShow?: (data: UIData) => boolean;
  text: Displayable;
  value?: number | Displayable | ((data: UIData) => number | Displayable);
  fixed?: number;
  variant?: string | ((data: UIData) => string);
  unit?: Displayable
}

export interface INodeFieldDisplay {
  canShow?: (data: UIData) => boolean;
  node: Node;
}

export type IFieldDisplay = INodeFieldDisplay | IBasicFieldDisplay

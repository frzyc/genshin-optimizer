import { NumNode } from "../Formula/type";
import { UIData } from "../Formula/uiData";

export interface IBasicFieldDisplay {
  canShow?: (data: UIData) => boolean;
  text: Displayable;
  value?: number | Displayable | ((data: UIData) => number | Displayable);
  fixed?: number;
  variant?: string | ((data: UIData) => string);
  unit?: Displayable
  textSuffix?: Displayable,
}

export interface INodeFieldDisplay {
  canShow?: (data: UIData) => boolean;
  textSuffix?: Displayable,
  node: NumNode;
}

export type IFieldDisplay = INodeFieldDisplay | IBasicFieldDisplay

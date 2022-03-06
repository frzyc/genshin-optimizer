import { UIData } from "../Formula/uiData";
import IConditional from "./IConditional_WR";
import { IFieldDisplay } from "./IFieldDisplay_WR";

export interface DocumentSection {
  canShow?: (data: UIData) => boolean
  text?: Displayable | ((data: UIData) => Displayable)
  header?: {
    title: Displayable;
    icon?: Displayable | ((data: UIData) => Displayable);
    action?: Displayable;
  }
  fields?: IFieldDisplay[]
  conditional?: IConditional
}
